"""
validate_charts.py (v3)
Validates every coin's tv_symbol directly via exchange REST APIs.
For invalid coins: tries alternative exchanges before deleting.
Fills missing slots from top-150 CoinGecko non-stablecoins.

Usage: python scripts/validate_charts.py
"""

import os, sys, time, requests
from typing import Optional
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
RANK_CAP = 150

sb        = create_client(SUPABASE_URL, SUPABASE_KEY)
ai_client = OpenAI(base_url="https://openrouter.ai/api/v1", api_key=OPENROUTER_KEY)

# USD stablecoins, gold/commodity tokens, wrapped/staked assets — no TA value
SKIP_COINS = {
    # USD stablecoins
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
    # Gold / commodity-backed tokens (price tracks gold, not crypto market)
    "tether-gold","pax-gold","cache-gold","meld-gold","kinesis-gold",
    # Wrapped / staked / rebasing (price mirrors parent asset, no independent chart)
    "wrapped-bitcoin","wrapped-ether","staked-ether","wrapped-steth",
    "coinbase-wrapped-staked-eth","rocket-pool-eth","frax-ether",
    "lido-staked-sol","binance-staked-sol","wrapped-eeth",
    # DeFi products / exchange-only tokens with no TradingView chart
    "figure-heloc","gatechain-token","hash-2","a7a5",
    "euro-coin","ethgas-2","siren-2",
}

# Canonical tv_symbol per coin — used as first candidate in validation
TV_SYMBOL_MAP = {
    "bitcoin":             "BINANCE:BTCUSDT",
    "ethereum":            "BINANCE:ETHUSDT",
    "binancecoin":         "BINANCE:BNBUSDT",
    "solana":              "BINANCE:SOLUSDT",
    "ripple":              "BINANCE:XRPUSDT",
    "cardano":             "BINANCE:ADAUSDT",
    "avalanche-2":         "BINANCE:AVAXUSDT",
    "dogecoin":            "BINANCE:DOGEUSDT",
    "tron":                "BINANCE:TRXUSDT",
    "polkadot":            "BINANCE:DOTUSDT",
    "chainlink":           "BINANCE:LINKUSDT",
    "matic-network":       "BINANCE:MATICUSDT",
    "litecoin":            "BINANCE:LTCUSDT",
    "shiba-inu":           "BINANCE:SHIBUSDT",
    "uniswap":             "BINANCE:UNIUSDT",
    "cosmos":              "BINANCE:ATOMUSDT",
    "stellar":             "BINANCE:XLMUSDT",
    "ethereum-classic":    "BINANCE:ETCUSDT",
    "filecoin":            "BINANCE:FILUSDT",
    "aptos":               "BINANCE:APTUSDT",
    "arbitrum":            "BINANCE:ARBUSDT",
    "optimism":            "BINANCE:OPUSDT",
    "near":                "BINANCE:NEARUSDT",
    "sui":                 "BINANCE:SUIUSDT",
    "pepe":                "BINANCE:PEPEUSDT",
    "injective-protocol":  "BINANCE:INJUSDT",
    "aave":                "BINANCE:AAVEUSDT",
    "lido-dao":            "BINANCE:LDOUSDT",
    "render-token":        "BINANCE:RENDERUSDT",
    "stacks":              "BINANCE:STXUSDT",
    "okb":                 "OKX:OKBUSDT",
    "cronos":              "BYBIT:CROUSDT",
    "hyperliquid":         "BYBIT:HYPEUSDT",
    "bittensor":           "BINANCE:TAOUSDT",    # fixed: was BYBIT:TAOUSDT
    "kaspa":               "BYBIT:KASUSDT",
    "monero":              "KRAKEN:XMRUSD",
    "bittorrent":          "BINANCE:BTTCUSDT",
    "internet-computer":   "BINANCE:ICPUSDT",
    "hedera-hashgraph":    "BINANCE:HBARUSDT",
    "vechain":             "BINANCE:VETUSDT",
    "mantle":              "BYBIT:MNTUSDT",      # fixed: was defaulting to BINANCE:MNTUSDT
}


# CoinGecko exchange ID mapping (accessible from all regions)
CG_EXCHANGE_ID = {
    "BINANCE": "binance",
    "BYBIT":   "bybit_spot",
    "OKX":     "okex",
    "KRAKEN":  "kraken",
}

def validate_via_coingecko(coin_id: str, tv_symbol: str) -> Optional[bool]:
    """
    True=valid, False=invalid, None=network error (keep).
    Checks CoinGecko tickers: coin must trade on the expected exchange with
    the expected base/quote pair.
    """
    try:
        tv_symbol.encode("ascii")
    except UnicodeEncodeError:
        return False  # non-ASCII garbage in symbol

    try:
        exchange_prefix, pair = tv_symbol.split(":", 1)
    except ValueError:
        return False

    cg_exchange = CG_EXCHANGE_ID.get(exchange_prefix)
    if cg_exchange is None:
        return True  # unknown exchange — keep

    if pair.endswith("USDT"):
        base, target = pair[:-4], "USDT"
    elif pair.endswith("USD"):
        base, target = pair[:-3], "USD"
    elif pair.endswith("BTC"):
        base, target = pair[:-3], "BTC"
    else:
        base, target = pair, "USDT"

    url = (f"https://api.coingecko.com/api/v3/coins/{coin_id}/tickers"
           f"?exchange_ids={cg_exchange}&depth=false")
    try:
        r = requests.get(url, timeout=15)
        if r.status_code == 429:
            print("    CoinGecko rate limit — waiting 30s...")
            time.sleep(30)
            r = requests.get(url, timeout=15)
        if r.status_code != 200:
            return None
        for t in r.json().get("tickers", []):
            if (t.get("base", "").upper() == base.upper() and
                    t.get("target", "").upper() == target.upper()):
                return True
        return False  # exchange accessible but pair not found
    except Exception as e:
        print(f"    network error: {e}")
        return None

def find_valid_tv_symbol(coin_id: str, symbol: str, current_tv: str = "") -> Optional[str]:
    """Try canonical map + 4 exchanges. Return first that CoinGecko confirms."""
    sym = symbol.upper().replace(" ", "")
    candidates = []
    if coin_id in TV_SYMBOL_MAP:
        candidates.append(TV_SYMBOL_MAP[coin_id])
    if current_tv and current_tv not in candidates:
        candidates.append(current_tv)
    for prefix, suffix in [("BINANCE","USDT"),("BYBIT","USDT"),("OKX","USDT"),("KRAKEN","USD")]:
        tv = f"{prefix}:{sym}{suffix}"
        if tv not in candidates:
            candidates.append(tv)

    for tv in candidates:
        result = validate_via_coingecko(coin_id, tv)
        if result is True:
            return tv
        time.sleep(1.5)  # CoinGecko rate limit
    return None


# ─────────────────────────────────────────
# Analysis helpers (shared with fill_missing.py)
# ─────────────────────────────────────────
def fetch_ohlcv(coin_id):
    url = (f"https://api.coingecko.com/api/v3/coins/{coin_id}/market_chart"
           f"?vs_currency=usd&days=365&interval=daily")
    for _ in range(3):
        try:
            r = requests.get(url, timeout=15)
            if r.status_code == 429:
                print("    rate limited, waiting 30s..."); time.sleep(30); continue
            data = r.json()
            if "prices" not in data or len(data["prices"]) < 30:
                return None
            prices = [p[1] for p in data["prices"]]
            return {"open": prices, "high": prices, "low": prices, "close": prices}
        except Exception as e:
            print(f"    error: {e}"); time.sleep(5)
    return None

def calc_rsi(close, period=14):
    deltas = [close[i]-close[i-1] for i in range(1, len(close))]
    gains  = [max(d, 0) for d in deltas]
    losses = [abs(min(d, 0)) for d in deltas]
    ag = sum(gains[:period]) / period
    al = sum(losses[:period]) / period
    rs = ag / al if al else 100
    return round(100 - (100 / (1 + rs)), 2)

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
    name  = coin["name"].encode("ascii", "replace").decode()
    ohlcv = fetch_ohlcv(coin["id"])
    if not ohlcv:
        print(f"  SKIP {name}: no price data"); return False

    close  = ohlcv["close"]
    rsi    = calc_rsi(close)
    ema20  = calc_ema(close, 20); ema50 = calc_ema(close, 50)
    golden = ema20[-1] > ema50[-1]
    diff   = (ema20[-1] - ema50[-1]) / ema50[-1] * 100
    trend  = "Bullish" if diff > 1.5 else "Bearish" if diff < -1.5 else "Sideways"
    support, resistance = detect_sr(ohlcv["high"], ohlcv["low"])

    score = 50
    if rsi < 65 and golden: score += 20
    if rsi < 30:             score += 10
    if rsi > 70:             score -= 15
    if not golden:           score -= 15
    score  = max(10, min(95, score))
    signal = "buy" if score >= 60 else "sell" if score <= 40 else "neutral"
    macd   = "Positif" if close[-1] > ema50[-1] else "Negatif"

    prompt = (
        f"Write a 2-sentence market analysis for {coin['name']} in plain English. "
        f"Data: RSI={rsi}, trend={trend}, signal={signal}, "
        f"support={support}, resistance={resistance}. "
        "Mention the most important S&R levels. Keep it simple, no jargon."
    )
    msg = ai_client.chat.completions.create(
        model="deepseek/deepseek-v3.2", max_tokens=200,
        messages=[{"role": "user", "content": prompt}],
    )
    narasi = msg.choices[0].message.content

    sb.table("coin_analysis").upsert({
        "coin_id":          coin["id"],
        "name":             coin["name"],
        "symbol":           coin["symbol"].upper(),
        "image_url":        coin["image"],
        "current_price":    coin["current_price"],
        "price_change_24h": coin.get("price_change_percentage_24h", 0),
        "market_cap_rank":  coin.get("market_cap_rank", 0),
        "signal":           signal, "score": score, "trend": trend,
        "rsi":              rsi, "macd": macd,
        "ema_cross":        "Golden Cross" if golden else "Death Cross",
        "support":          [{"price": s, "strength": "strong"} for s in support],
        "resistance":       [{"price": r, "strength": "medium"} for r in resistance],
        "narasi":           narasi,
        "tv_symbol":        tv_symbol,
    }).execute()
    print(f"  OK {name}: {signal.upper()} ({score}/100)")
    return True


# ═════════════════════════════════════════
# MAIN
# ═════════════════════════════════════════
print("=" * 60)

# ── STEP 1: Load DB ──
print("STEP 1: Loading coins from Supabase...")
rows = sb.table("coin_analysis").select("coin_id,symbol,tv_symbol").execute().data
print(f"  {len(rows)} coins in DB")

# ── STEP 2: Remove skip-list coins (stablecoins, gold, wrapped) ──
print("\nSTEP 2: Removing skip-list coins...")
skip_deleted = []
for row in rows:
    if row["coin_id"] in SKIP_COINS:
        sb.table("coin_analysis").delete().eq("coin_id", row["coin_id"]).execute()
        print(f"  Deleted (skip-list): {row['coin_id']}")
        skip_deleted.append(row["coin_id"])
rows = [r for r in rows if r["coin_id"] not in SKIP_COINS]
print(f"  Removed {len(skip_deleted)} skip-list coins. {len(rows)} remain.")

# ── STEP 3: Validate tv_symbols via exchange REST APIs ──
print(f"\nSTEP 3: Validating {len(rows)} tv_symbols via exchange REST APIs...")
to_delete  = []
to_fix     = {}  # coin_id → new tv_symbol

for i, row in enumerate(rows):
    coin_id    = row["coin_id"]
    symbol     = row.get("symbol", "").upper()
    tv_symbol  = row["tv_symbol"] or ""

    result = validate_via_coingecko(coin_id, tv_symbol)

    if result is True:
        print(f"  [{i+1:3}/{len(rows)}] ✓ {coin_id:32} {tv_symbol}")
    elif result is None:
        print(f"  [{i+1:3}/{len(rows)}] ? net-err (kept) {coin_id:26} {tv_symbol}")
    else:
        print(f"  [{i+1:3}/{len(rows)}] ✗ {coin_id:32} {tv_symbol} → searching alt...")
        alt = find_valid_tv_symbol(coin_id, symbol, tv_symbol)
        if alt and alt != tv_symbol:
            to_fix[coin_id] = alt
            print(f"    → fix: {alt}")
        elif alt == tv_symbol:
            pass  # re-validated OK
        else:
            to_delete.append(coin_id)
            print(f"    → no valid symbol — will delete")

    time.sleep(1.5)  # CoinGecko rate limit between coins

print(f"\n  {len(to_fix)} fixable | {len(to_delete)} to delete | "
      f"{len(rows)-len(to_fix)-len(to_delete)} already valid")

# ── STEP 4: Update tv_symbol for fixable coins (keep analysis data) ──
if to_fix:
    print(f"\nSTEP 4: Updating {len(to_fix)} tv_symbols...")
    for coin_id, new_tv in to_fix.items():
        sb.table("coin_analysis").update({"tv_symbol": new_tv}).eq("coin_id", coin_id).execute()
        print(f"  Updated: {coin_id} → {new_tv}")
else:
    print("\nSTEP 4: No updates needed.")

# ── STEP 5: Delete truly invalid coins ──
if to_delete:
    print(f"\nSTEP 5: Deleting {len(to_delete)} invalid coins...")
    for coin_id in to_delete:
        sb.table("coin_analysis").delete().eq("coin_id", coin_id).execute()
        print(f"  Deleted: {coin_id}")
else:
    print("\nSTEP 5: No deletions needed.")

# ── STEP 6: Fill missing slots ──
print("\nSTEP 6: Checking fill requirement...")
existing = {r["coin_id"] for r in sb.table("coin_analysis").select("coin_id").execute().data}
needed   = TARGET - len(existing)
print(f"  DB has {len(existing)} coins, need {needed} more")

if needed <= 0:
    final = sb.table("coin_analysis").select("coin_id", count="exact").execute()
    print(f"\nDone. Skip-deleted {len(skip_deleted)} | Fixed {len(to_fix)} | "
          f"Deleted {len(to_delete)} invalid | DB has {final.count} coins.")
    sys.exit(0)

print(f"\n  Fetching top {RANK_CAP} candidates from CoinGecko...")
raw_candidates = []
for page in range(1, 3):
    url = (
        f"https://api.coingecko.com/api/v3/coins/markets"
        f"?vs_currency=usd&order=market_cap_desc&per_page=100&page={page}&sparkline=false"
    )
    for _ in range(5):
        r = requests.get(url, timeout=15)
        if r.status_code == 200:
            break
        print(f"  Rate limited (page {page}), waiting 30s...")
        time.sleep(30)
    if r.status_code != 200:
        print(f"  Failed page {page}, skipping")
        continue
    for coin in r.json():
        if not isinstance(coin, dict):
            continue
        if (coin.get("market_cap_rank") or 999) > RANK_CAP:
            break
        if coin["id"] in SKIP_COINS or coin["id"] in existing:
            continue
        raw_candidates.append(coin)
    time.sleep(1.5)

print(f"  {len(raw_candidates)} eligible candidates")
print("  Validating candidates via CoinGecko tickers...")
valid_candidates = []
for coin in raw_candidates:
    if len(valid_candidates) >= needed:
        break
    tv_symbol = find_valid_tv_symbol(coin["id"], coin["symbol"])
    if tv_symbol:
        valid_candidates.append((coin, tv_symbol))
        print(f"    ✓ {coin['name']:30} {tv_symbol}")
    else:
        print(f"    ✗ {coin['name']:30} no valid exchange")
    time.sleep(1.5)

if not valid_candidates:
    print("  No valid candidates. DB stays as-is.")
    sys.exit(0)

# ── STEP 7: Analyze and insert replacements ──
print(f"\nSTEP 7: Analyzing and inserting {len(valid_candidates)} replacements...")
inserted = 0
for i, (coin, tv_symbol) in enumerate(valid_candidates):
    if i > 0:
        time.sleep(8)
    print(f"[{i+1}/{len(valid_candidates)}] {coin['name']}...")
    try:
        if analyze_and_insert(coin, tv_symbol):
            inserted += 1
    except Exception as e:
        print(f"  ERR {coin['name']}: {str(e)[:80]}")

final = sb.table("coin_analysis").select("coin_id", count="exact").execute()
print(
    f"\nDone. Skip-deleted {len(skip_deleted)} | Fixed {len(to_fix)} | "
    f"Deleted {len(to_delete)} invalid | Inserted {inserted} new | "
    f"DB now has {final.count} coins."
)
