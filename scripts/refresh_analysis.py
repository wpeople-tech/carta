"""
refresh_analysis.py
Re-runs full analysis (prices, RSI, EMA, S/R, signal, narasi) for all coins
in coins_snapshot.json. Never touches coin_id or tv_symbol.

Usage: python scripts/refresh_analysis.py
"""
import os, sys, time, json, requests
from openai import OpenAI
from supabase import create_client

sys.stdout.reconfigure(encoding="utf-8")

_DOTENV = os.path.join(os.path.dirname(__file__), "..", ".env.local")
if os.path.exists(_DOTENV):
    for l in open(_DOTENV):
        if "=" in l and not l.startswith("#"):
            k, v = l.strip().split("=", 1); os.environ.setdefault(k, v)

SUPABASE_URL   = os.environ.get("SUPABASE_URL") or os.environ.get("NEXT_PUBLIC_SUPABASE_URL", "")
SUPABASE_KEY   = os.environ["SUPABASE_SERVICE_KEY"]
OPENROUTER_KEY = os.environ["OPENROUTER_API_KEY"]

sb        = create_client(SUPABASE_URL, SUPABASE_KEY)
ai_client = OpenAI(base_url="https://openrouter.ai/api/v1", api_key=OPENROUTER_KEY)

snap_path = os.path.join(os.path.dirname(__file__), "coins_snapshot.json")
with open(snap_path, encoding="utf-8") as f:
    snapshot = json.load(f)

coins_list = snapshot["coins"]
print(f"Loaded {len(coins_list)} coins from snapshot ({snapshot['validated_at']})")
print(f"Fetching fresh market data from CoinGecko...\n")

# ── Fetch current prices for all coins in one batch ──
def fetch_market_batch(coin_ids: list[str]) -> dict:
    """Returns {coin_id: {current_price, price_change_24h, market_cap_rank, image}}"""
    result = {}
    for i in range(0, len(coin_ids), 50):
        batch = coin_ids[i:i+50]
        ids_str = ",".join(batch)
        url = (f"https://api.coingecko.com/api/v3/coins/markets"
               f"?vs_currency=usd&ids={ids_str}&order=market_cap_desc"
               f"&per_page=250&sparkline=false")
        for attempt in range(3):
            r = requests.get(url, timeout=15)
            if r.status_code == 429:
                print("  rate limit, waiting 30s..."); time.sleep(30); continue
            if r.status_code == 200:
                for c in r.json():
                    result[c["id"]] = {
                        "current_price":    c.get("current_price", 0),
                        "price_change_24h": c.get("price_change_percentage_24h", 0),
                        "market_cap_rank":  c.get("market_cap_rank", 0),
                        "image_url":        c.get("image", ""),
                        "name":             c.get("name", ""),
                        "symbol":           c.get("symbol", "").upper(),
                    }
                break
            time.sleep(5)
        if i + 50 < len(coin_ids):
            time.sleep(1.5)
    return result

# ── OHLCV ──
def fetch_ohlcv(coin_id: str):
    url = (f"https://api.coingecko.com/api/v3/coins/{coin_id}/market_chart"
           f"?vs_currency=usd&days=365&interval=daily")
    for _ in range(3):
        try:
            r = requests.get(url, timeout=15)
            if r.status_code == 429:
                print("    rate limit, waiting 30s..."); time.sleep(30); continue
            data = r.json()
            if "prices" not in data or len(data["prices"]) < 30:
                return None
            prices = [p[1] for p in data["prices"]]
            return {"close": prices, "high": prices, "low": prices}
        except Exception as e:
            print(f"    error: {e}"); time.sleep(5)
    return None

# ── Indicators ──
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
        if lows[i]  == min(lows[i-n:i+n]):  support.append(round(lows[i], 8))
        if highs[i] == max(highs[i-n:i+n]): resistance.append(round(highs[i], 8))
    def dedup(lvls):
        res = []
        for lv in sorted(lvls):
            if lv <= 0: continue
            if not res or (lv - res[-1]) / res[-1] > 0.02: res.append(lv)
        return res
    s = dedup(support); r = dedup(resistance)
    return s[-3:] if len(s) > 3 else s, r[:3] if len(r) > 3 else r

# ── Main ──
coin_ids = [c["coin_id"] for c in coins_list]
print("Fetching market data for all 100 coins...")
market = fetch_market_batch(coin_ids)
print(f"Got market data for {len(market)} coins\n")

ok = err = skip = 0
for i, snap_coin in enumerate(coins_list):
    coin_id  = snap_coin["coin_id"]
    tv_symbol = snap_coin["tv_symbol"]
    mkt = market.get(coin_id, {})
    name = mkt.get("name") or snap_coin["name"]
    name_ascii = name.encode("ascii", "replace").decode()

    try:
        if i > 0: time.sleep(8)
        print(f"[{i+1:3}/100] {name_ascii}...")

        ohlcv = fetch_ohlcv(coin_id)
        if not ohlcv:
            print(f"  SKIP: no price data"); skip += 1; continue

        close  = ohlcv["close"]
        rsi    = calc_rsi(close)
        ema20  = calc_ema(close, 20)
        ema50  = calc_ema(close, 50)
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
            f"Write a 2-sentence market analysis for {name} in plain English. "
            f"Data: RSI={rsi}, trend={trend}, signal={signal}, "
            f"support={support}, resistance={resistance}. "
            "Mention the most important S&R levels. Keep it simple, no jargon."
        )
        msg    = ai_client.chat.completions.create(
            model="deepseek/deepseek-v3.2", max_tokens=200,
            messages=[{"role": "user", "content": prompt}],
        )
        narasi = msg.choices[0].message.content

        sb.table("coin_analysis").update({
            "name":             mkt.get("name", snap_coin["name"]),
            "symbol":           mkt.get("symbol", snap_coin["symbol"]),
            "image_url":        mkt.get("image_url", ""),
            "current_price":    mkt.get("current_price", 0),
            "price_change_24h": mkt.get("price_change_24h", 0),
            "market_cap_rank":  mkt.get("market_cap_rank", 0),
            "signal":           signal,
            "score":            score,
            "trend":            trend,
            "rsi":              rsi,
            "macd":             macd,
            "ema_cross":        "Golden Cross" if golden else "Death Cross",
            "support":          [{"price": s, "strength": "strong"} for s in support],
            "resistance":       [{"price": r, "strength": "medium"} for r in resistance],
            "narasi":           narasi,
            # tv_symbol intentionally NOT updated
        }).eq("coin_id", coin_id).execute()

        print(f"  OK {signal.upper():7} {score}/100  RSI={rsi}  S={len(support)} R={len(resistance)}")
        ok += 1

    except Exception as e:
        print(f"  ERR: {str(e)[:80]}")
        err += 1

print(f"\nDone. OK={ok} | Skip={skip} | Err={err}")
print("Run restore_snapshot.py to verify tv_symbols are intact.")
