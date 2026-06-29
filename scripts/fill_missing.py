"""
fill_missing.py
Adds only coins not yet in DB to reach target count. Much faster than full re-run.
"""
import os, time, sys
import requests
from openai import OpenAI
from supabase import create_client

sys.stdout.reconfigure(encoding='utf-8')

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
RANK_CAP = 150  # never accept coins ranked below this

SKIP_COINS = {
    "tether","usd-coin","usds","dai","paypal-usd","global-dollar",
    "ripple-usd","usdd","bfusd","gho","usdtb","united-stables",
    "usual-usd","ethena-usde","ylds","falcon-finance","eutbl",
    "hashnote-usyc","blackrock-usd-institutional-digital-liquidity-fund",
    "janus-henderson-anemoy-treasury-fund","ondo-us-dollar-yield",
    "superstate-short-duration-us-government-securities-fund-ustb",
    "ousg","frax","true-usd","first-digital-usd","binance-usd",
    "paxos-standard","gemini-dollar","liquity-usd","usd-plus",
    "usd1-wlfi","apxusd","usx",
    "spiko-amundi-overnight-swap-fund-eur",
    "blockchain-capital","janus-henderson-anemoy-aaa-clo-fund","eurc",
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
    "whitebit": "BYBIT:WBTUSDT", "leo-token": "BYBIT:LEOUSDT",
    "okb": "OKX:OKBUSDT", "cronos": "BYBIT:CROUSDT",
    "hyperliquid": "BYBIT:HYPEUSDT", "bittensor": "BYBIT:TAOUSDT",
    "kaspa": "BYBIT:KASUSDT", "monero": "KRAKEN:XMRUSD",
    "bittorrent": "BINANCE:BTTCUSDT", "internet-computer": "BINANCE:ICPUSDT",
    "hedera-hashgraph": "BINANCE:HBARUSDT", "vechain": "BINANCE:VETUSDT",
}

ai_client = OpenAI(base_url="https://openrouter.ai/api/v1", api_key=OPENROUTER_KEY)
sb = create_client(SUPABASE_URL, SUPABASE_KEY)

# 1. Get existing coin_ids
existing = {r["coin_id"] for r in sb.table("coin_analysis").select("coin_id").execute().data}
current_count = len(existing)
needed = TARGET - current_count
print(f"DB has {current_count} coins, need {needed} more to reach {TARGET}")

if needed <= 0:
    print("Already at target. Nothing to do.")
    exit()

# 2. Fetch top coins until we find `needed` missing ones
candidates = []
page = 1
while len(candidates) < needed:
    url = (f"https://api.coingecko.com/api/v3/coins/markets"
           f"?vs_currency=usd&order=market_cap_desc&per_page=100&page={page}&sparkline=false")
    r = requests.get(url, timeout=15)
    if r.status_code == 429:
        print("Rate limited, waiting 30s...")
        time.sleep(30)
        continue
    for coin in r.json():
        rank = coin.get("market_cap_rank") or 999
        if rank > RANK_CAP:
            break  # list is ordered desc by market cap
        if coin["id"] not in SKIP_COINS and coin["id"] not in existing:
            candidates.append(coin)
            if len(candidates) >= needed:
                break
    if len(candidates) >= needed:
        break
    page += 1
    time.sleep(1.5)

print(f"Found {len(candidates)} new coins to add: {[c['name'] for c in candidates]}")

# 3. Analyze and insert
def fetch_ohlcv(coin_id):
    url = (f"https://api.coingecko.com/api/v3/coins/{coin_id}/market_chart"
           f"?vs_currency=usd&days=365&interval=daily")
    for attempt in range(3):
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
    deltas = [close[i]-close[i-1] for i in range(1,len(close))]
    gains = [max(d,0) for d in deltas]; losses = [abs(min(d,0)) for d in deltas]
    ag = sum(gains[:period])/period; al = sum(losses[:period])/period
    rs = ag/al if al else 100
    return round(100-(100/(1+rs)),2)

def calc_ema(data, period):
    k = 2/(period+1); ema = [data[0]]
    for p in data[1:]: ema.append(p*k+ema[-1]*(1-k))
    return ema

def detect_sr(highs, lows, n=10):
    support, resistance = [], []
    for i in range(n, len(lows)-n):
        if lows[i] == min(lows[i-n:i+n]): support.append(round(lows[i],4))
        if highs[i] == max(highs[i-n:i+n]): resistance.append(round(highs[i],4))
    def dedup(lvls):
        res = []
        for lv in sorted(lvls):
            if lv == 0: continue
            if not res or res[-1] == 0 or (lv-res[-1])/res[-1] > 0.02: res.append(lv)
        return res
    s = dedup(support); r = dedup(resistance)
    return s[-3:] if len(s)>3 else s, r[:3] if len(r)>3 else r

for i, coin in enumerate(candidates):
    name = coin['name'].encode('ascii','replace').decode()
    try:
        if i > 0: time.sleep(8)
        print(f"[{i+1}/{len(candidates)}] {name}...")
        ohlcv = fetch_ohlcv(coin["id"])
        if not ohlcv:
            print(f"  SKIP {name}: no price data"); continue

        close = ohlcv["close"]
        rsi = calc_rsi(close)
        ema20 = calc_ema(close, 20); ema50 = calc_ema(close, 50)
        golden = ema20[-1] > ema50[-1]
        diff = (ema20[-1]-ema50[-1])/ema50[-1]*100
        trend = "Bullish" if diff>1.5 else "Bearish" if diff<-1.5 else "Sideways"
        support, resistance = detect_sr(ohlcv["high"], ohlcv["low"])
        score = 50
        if rsi<65 and golden: score+=20
        if rsi<30: score+=10
        if rsi>70: score-=15
        if not golden: score-=15
        score = max(10, min(95, score))
        signal = "buy" if score>=60 else "sell" if score<=40 else "neutral"
        macd = "Positif" if close[-1]>ema50[-1] else "Negatif"

        analysis = {"signal":signal,"score":score,"trend":trend,"rsi":rsi,"macd":macd,
                    "ema_cross":"Golden Cross" if golden else "Death Cross",
                    "support":[{"price":s,"strength":"strong"} for s in support],
                    "resistance":[{"price":r,"strength":"medium"} for r in resistance]}

        prompt = (f"Write a 2-sentence market analysis for {coin['name']} in plain English. "
                  f"Data: RSI={rsi}, trend={trend}, signal={signal}, support={support}, resistance={resistance}. "
                  "Mention the most important S&R levels. Keep it simple, no jargon.")
        msg = ai_client.chat.completions.create(
            model="deepseek/deepseek-v3.2", max_tokens=200,
            messages=[{"role":"user","content":prompt}])
        narasi = msg.choices[0].message.content

        sb.table("coin_analysis").upsert({
            "coin_id": coin["id"], "name": coin["name"],
            "symbol": coin["symbol"].upper(), "image_url": coin["image"],
            "current_price": coin["current_price"],
            "price_change_24h": coin.get("price_change_percentage_24h",0),
            "market_cap_rank": coin.get("market_cap_rank", 0),
            "signal": signal, "score": score, "trend": trend,
            "rsi": rsi, "macd": macd,
            "ema_cross": "Golden Cross" if golden else "Death Cross",
            "support": analysis["support"], "resistance": analysis["resistance"],
            "narasi": narasi,
            "tv_symbol": TV_SYMBOL_MAP.get(coin["id"], f"BINANCE:{coin['symbol'].upper()}USDT"),
        }).execute()
        print(f"  OK {name}: {signal.upper()} ({score}/100)")

    except Exception as e:
        print(f"  ERR {name}: {str(e)[:80]}")

final = sb.table("coin_analysis").select("coin_id", count="exact").execute()
print(f"\nDone. DB now has {final.count} coins.")
