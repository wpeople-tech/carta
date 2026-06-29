"""
patch_known.py
Hard-fixes tv_symbol for coins we know are broken, without needing
exchange API access. Run this after validate_charts.py if exchange
APIs are blocked from your environment.

Fixes:
  bittensor  BYBIT:TAOUSDT  → BINANCE:TAOUSDT  (TAO is on Binance)
  mantle     BINANCE:MNTUSDT → BYBIT:MNTUSDT   (MNT not on Binance spot)

Deletes (no valid chart on major exchanges):
  whitebit   (WBT — exchange's own token, only on WhiteBIT)
  leo-token  (LEO — Bitfinex token, not charted on TradingView well)
  memecore   (very new/obscure, no reliable chart)

After deletions, runs fill_missing logic to replace with validated coins.

Usage: python scripts/patch_known.py
"""

import os, sys, time, requests
from openai import OpenAI
from supabase import create_client

sys.stdout.reconfigure(encoding="utf-8")

_DOTENV = os.path.join(os.path.dirname(__file__), "..", ".env.local")
if os.path.exists(_DOTENV):
    for _line in open(_DOTENV):
        if "=" in _line and not _line.startswith("#"):
            k, v = _line.strip().split("=", 1)
            os.environ.setdefault(k, v)

SUPABASE_URL   = os.environ.get("SUPABASE_URL") or os.environ.get("NEXT_PUBLIC_SUPABASE_URL", "")
SUPABASE_KEY   = os.environ["SUPABASE_SERVICE_KEY"]
OPENROUTER_KEY = os.environ["OPENROUTER_API_KEY"]

TARGET   = 100
RANK_CAP = 200  # wider net since we only need a few replacements

sb        = create_client(SUPABASE_URL, SUPABASE_KEY)
ai_client = OpenAI(base_url="https://openrouter.ai/api/v1", api_key=OPENROUTER_KEY)

# tv_symbol fixes — known correct mappings
FIXES = {
    "bittensor": "BINANCE:TAOUSDT",
    "mantle":    "BYBIT:MNTUSDT",
}

# Coins to delete — no reliable TradingView chart available
# Note: whitebit/leo-token/memecore removed — validate_charts.py found valid
# exchanges for them (KRAKEN:WBTUSD, OKX:LEOUSDT, KRAKEN:MUSD)
DELETE_IDS = {
    "figure-heloc",      # DeFi product, symbol has underscore, no chart
    "gatechain-token",   # GT — not on Binance, no valid major exchange
    "hash-2",            # HASH Provenance — not on Binance, no valid chart
    "a7a5",              # obscure, no exchange listing
}

SKIP_COINS = {
    "tether","usd-coin","usds","dai","paypal-usd","global-dollar",
    "ripple-usd","usdd","bfusd","gho","usdtb","united-stables",
    "usual-usd","ethena-usde","ylds","falcon-finance","eutbl",
    "hashnote-usyc","blackrock-usd-institutional-digital-liquidity-fund",
    "janus-henderson-anemoy-treasury-fund","ondo-us-dollar-yield",
    "superstate-short-duration-us-government-securities-fund-ustb",
    "ousg","frax","true-usd","first-digital-usd","binance-usd",
    "paxos-standard","gemini-dollar","liquity-usd","usd-plus",
    "usd1-wlfi","apxusd","usx","spiko-amundi-overnight-swap-fund-eur",
    "blockchain-capital","janus-henderson-anemoy-aaa-clo-fund","eurc",
    "tether-gold","pax-gold","cache-gold","meld-gold","kinesis-gold",
    "wrapped-bitcoin","wrapped-ether","staked-ether","wrapped-steth",
    "coinbase-wrapped-staked-eth","rocket-pool-eth","frax-ether",
    "lido-staked-sol","binance-staked-sol","wrapped-eeth",
}

TV_SYMBOL_MAP = {
    "bitcoin": "BINANCE:BTCUSDT", "ethereum": "BINANCE:ETHUSDT",
    "binancecoin": "BINANCE:BNBUSDT", "solana": "BINANCE:SOLUSDT",
    "ripple": "BINANCE:XRPUSDT", "cardano": "BINANCE:ADAUSDT",
    "avalanche-2": "BINANCE:AVAXUSDT", "dogecoin": "BINANCE:DOGEUSDT",
    "tron": "BINANCE:TRXUSDT", "polkadot": "BINANCE:DOTUSDT",
    "chainlink": "BINANCE:LINKUSDT", "matic-network": "BINANCE:MATICUSDT",
    "litecoin": "BINANCE:LTCUSDT", "shiba-inu": "BINANCE:SHIBUSDT",
    "uniswap": "BINANCE:UNIUSDT", "cosmos": "BINANCE:ATOMUSDT",
    "stellar": "BINANCE:XLMUSDT", "ethereum-classic": "BINANCE:ETCUSDT",
    "filecoin": "BINANCE:FILUSDT", "aptos": "BINANCE:APTUSDT",
    "arbitrum": "BINANCE:ARBUSDT", "optimism": "BINANCE:OPUSDT",
    "near": "BINANCE:NEARUSDT", "sui": "BINANCE:SUIUSDT",
    "pepe": "BINANCE:PEPEUSDT", "injective-protocol": "BINANCE:INJUSDT",
    "aave": "BINANCE:AAVEUSDT", "lido-dao": "BINANCE:LDOUSDT",
    "render-token": "BINANCE:RENDERUSDT", "stacks": "BINANCE:STXUSDT",
    "okb": "OKX:OKBUSDT", "cronos": "BYBIT:CROUSDT",
    "hyperliquid": "BYBIT:HYPEUSDT", "bittensor": "BINANCE:TAOUSDT",
    "kaspa": "BYBIT:KASUSDT", "monero": "KRAKEN:XMRUSD",
    "bittorrent": "BINANCE:BTTCUSDT", "internet-computer": "BINANCE:ICPUSDT",
    "hedera-hashgraph": "BINANCE:HBARUSDT", "vechain": "BINANCE:VETUSDT",
    "mantle": "BYBIT:MNTUSDT",
}

# ── Shared analysis helpers ──
def fetch_ohlcv(coin_id):
    url = (f"https://api.coingecko.com/api/v3/coins/{coin_id}/market_chart"
           f"?vs_currency=usd&days=365&interval=daily")
    for _ in range(3):
        try:
            r = requests.get(url, timeout=15)
            if r.status_code == 429:
                print("    rate limited, waiting 30s..."); time.sleep(30); continue
            data = r.json()
            if "prices" not in data or len(data["prices"]) < 30: return None
            prices = [p[1] for p in data["prices"]]
            return {"open": prices, "high": prices, "low": prices, "close": prices}
        except Exception as e:
            print(f"    error: {e}"); time.sleep(5)
    return None

def calc_rsi(close, period=14):
    deltas = [close[i]-close[i-1] for i in range(1, len(close))]
    gains  = [max(d, 0) for d in deltas]
    losses = [abs(min(d, 0)) for d in deltas]
    ag = sum(gains[:period]) / period; al = sum(losses[:period]) / period
    return round(100 - (100 / (1 + (ag / al if al else 100))), 2)

def calc_ema(data, period):
    k = 2 / (period + 1); ema = [data[0]]
    for p in data[1:]: ema.append(p * k + ema[-1] * (1 - k))
    return ema

def detect_sr(highs, lows, n=10):
    support, resistance = [], []
    for i in range(n, len(lows) - n):
        if lows[i]  == min(lows[i-n:i+n]):  support.append(round(lows[i], 4))
        if highs[i] == max(highs[i-n:i+n]): resistance.append(round(highs[i], 4))
    def dedup(lvls):
        res = []
        for lv in sorted(lvls):
            if lv == 0: continue
            if not res or (lv - res[-1]) / res[-1] > 0.02: res.append(lv)
        return res
    s = dedup(support); r = dedup(resistance)
    return s[-3:] if len(s) > 3 else s, r[:3] if len(r) > 3 else r

def analyze_and_insert(coin, tv_symbol):
    name = coin["name"].encode("ascii", "replace").decode()
    ohlcv = fetch_ohlcv(coin["id"])
    if not ohlcv:
        print(f"  SKIP {name}: no price data"); return False
    close = ohlcv["close"]
    rsi = calc_rsi(close)
    ema20 = calc_ema(close, 20); ema50 = calc_ema(close, 50)
    golden = ema20[-1] > ema50[-1]
    diff = (ema20[-1] - ema50[-1]) / ema50[-1] * 100
    trend = "Bullish" if diff > 1.5 else "Bearish" if diff < -1.5 else "Sideways"
    support, resistance = detect_sr(ohlcv["high"], ohlcv["low"])
    score = 50
    if rsi < 65 and golden: score += 20
    if rsi < 30: score += 10
    if rsi > 70: score -= 15
    if not golden: score -= 15
    score = max(10, min(95, score))
    signal = "buy" if score >= 60 else "sell" if score <= 40 else "neutral"
    macd = "Positif" if close[-1] > ema50[-1] else "Negatif"
    prompt = (f"Write a 2-sentence market analysis for {coin['name']} in plain English. "
              f"Data: RSI={rsi}, trend={trend}, signal={signal}, support={support}, resistance={resistance}. "
              "Mention the most important S&R levels. Keep it simple, no jargon.")
    msg = ai_client.chat.completions.create(
        model="deepseek/deepseek-v3.2", max_tokens=200,
        messages=[{"role": "user", "content": prompt}])
    narasi = msg.choices[0].message.content
    sb.table("coin_analysis").upsert({
        "coin_id": coin["id"], "name": coin["name"],
        "symbol": coin["symbol"].upper(), "image_url": coin["image"],
        "current_price": coin["current_price"],
        "price_change_24h": coin.get("price_change_percentage_24h", 0),
        "market_cap_rank": coin.get("market_cap_rank", 0),
        "signal": signal, "score": score, "trend": trend,
        "rsi": rsi, "macd": macd,
        "ema_cross": "Golden Cross" if golden else "Death Cross",
        "support": [{"price": s, "strength": "strong"} for s in support],
        "resistance": [{"price": r, "strength": "medium"} for r in resistance],
        "narasi": narasi, "tv_symbol": tv_symbol,
    }).execute()
    print(f"  OK {name}: {signal.upper()} ({score}/100)")
    return True

# ══════════════════════════════════
print("=" * 50)

# STEP 1: Apply tv_symbol fixes
print("STEP 1: Applying known tv_symbol fixes...")
for coin_id, new_tv in FIXES.items():
    res = sb.table("coin_analysis").select("coin_id,tv_symbol").eq("coin_id", coin_id).execute()
    if res.data:
        old_tv = res.data[0]["tv_symbol"]
        sb.table("coin_analysis").update({"tv_symbol": new_tv}).eq("coin_id", coin_id).execute()
        print(f"  Updated: {coin_id}  {old_tv} → {new_tv}")
    else:
        print(f"  Skip (not in DB): {coin_id}")

# STEP 2: Delete known-bad coins
print("\nSTEP 2: Deleting coins with no valid chart source...")
deleted = []
for coin_id in DELETE_IDS:
    res = sb.table("coin_analysis").select("coin_id").eq("coin_id", coin_id).execute()
    if res.data:
        sb.table("coin_analysis").delete().eq("coin_id", coin_id).execute()
        print(f"  Deleted: {coin_id}")
        deleted.append(coin_id)
    else:
        print(f"  Not in DB (already removed): {coin_id}")

# STEP 3: Fill missing slots from CoinGecko
print("\nSTEP 3: Checking fill requirement...")
existing = {r["coin_id"] for r in sb.table("coin_analysis").select("coin_id").execute().data}
needed = TARGET - len(existing)
print(f"  DB has {len(existing)} coins, need {needed} more to reach {TARGET}")

if needed <= 0:
    print("  Already at target.")
else:
    # Also skip coins we just deleted — prevent them from being re-added
    skip_all = SKIP_COINS | DELETE_IDS

    print(f"  Fetching candidates from CoinGecko (top {RANK_CAP})...")
    candidates = []
    page = 1
    while len(candidates) < needed and page <= 3:
        url = (f"https://api.coingecko.com/api/v3/coins/markets"
               f"?vs_currency=usd&order=market_cap_desc&per_page=100&page={page}&sparkline=false")
        r = requests.get(url, timeout=15)
        if r.status_code == 429:
            print("  Rate limited, waiting 30s..."); time.sleep(30); continue
        if r.status_code != 200:
            print(f"  HTTP {r.status_code}, skipping page {page}"); page += 1; continue
        for coin in r.json():
            rank = coin.get("market_cap_rank") or 999
            if rank > RANK_CAP: break
            if coin["id"] not in skip_all and coin["id"] not in existing:
                candidates.append(coin)
                if len(candidates) >= needed: break
        page += 1
        time.sleep(1.5)

    print(f"  Found {len(candidates)} candidates: {[c['name'] for c in candidates]}")
    print("\nSTEP 4: Analyzing and inserting...")
    inserted = 0
    for i, coin in enumerate(candidates):
        if i > 0: time.sleep(8)
        name = coin["name"].encode("ascii", "replace").decode()
        print(f"[{i+1}/{len(candidates)}] {name}...")
        try:
            tv = TV_SYMBOL_MAP.get(coin["id"], f"BINANCE:{coin['symbol'].upper()}USDT")
            if analyze_and_insert(coin, tv):
                inserted += 1
        except Exception as e:
            print(f"  ERR {name}: {str(e)[:80]}")

    print(f"\n  Inserted {inserted} new coins.")

final = sb.table("coin_analysis").select("coin_id", count="exact").execute()
print(f"\nDone. Fixed {len(FIXES)} | Deleted {len(deleted)} | DB now has {final.count} coins.")
