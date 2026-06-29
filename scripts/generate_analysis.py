"""
CryptoLens — Data Generation Script
Run once: python scripts/generate_analysis.py

Fetches top 100 coins from CoinGecko, computes technical analysis,
generates AI narrative via OpenRouter (DeepSeek V3.2), and upserts to Supabase.
"""

import os, json, time, sys
import requests
from openai import OpenAI
from supabase import create_client

sys.stdout.reconfigure(encoding='utf-8')

# Load from .env.local if not in environment
_DOTENV = os.path.join(os.path.dirname(__file__), "..", ".env.local")
if os.path.exists(_DOTENV):
    for _line in open(_DOTENV):
        _line = _line.strip()
        if "=" in _line and not _line.startswith("#"):
            _k, _v = _line.split("=", 1)
            os.environ.setdefault(_k, _v)

SUPABASE_URL   = os.environ.get("SUPABASE_URL") or os.environ.get("NEXT_PUBLIC_SUPABASE_URL", "")
SUPABASE_KEY   = os.environ["SUPABASE_SERVICE_KEY"]
OPENROUTER_KEY = os.environ["OPENROUTER_API_KEY"]

# Stablecoins and yield products — skip entirely, no TA value
SKIP_COINS = {
    "tether","usd-coin","usds","dai","paypal-usd","global-dollar",
    "ripple-usd","usdd","bfusd","gho","usdtb","united-stables",
    "usual-usd","ethena-usde","ylds","falcon-finance","eutbl",
    "hashnote-usyc","blackrock-usd-institutional-digital-liquidity-fund",
    "janus-henderson-anemoy-treasury-fund","ondo-us-dollar-yield",
    "superstate-short-duration-us-government-securities-fund-ustb",
    "ousg","frax","true-usd","first-digital-usd","binance-usd",
    "paxos-standard","gemini-dollar","liquity-usd","usd-plus",
}

ai_client = OpenAI(
    base_url="https://openrouter.ai/api/v1",
    api_key=OPENROUTER_KEY,
)

TV_SYMBOL_MAP = {
    # Top majors
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
    # Stablecoins — skip chart (frontend handles these)
    "tether": "BINANCE:USDTUSDC", "usd-coin": "BINANCE:USDCUSDT",
    "dai": "BINANCE:DAIUSDT", "first-digital-usd": "BINANCE:FDUSDUSDT",
    "true-usd": "BINANCE:TUSDUSDT", "usdd": "BYBIT:USDDUSDT",
    "frax": "BYBIT:FRAXUSDT", "paypal-usd": "BYBIT:PYUSDUSDT",
    # Wrapped / pegged assets
    "wrapped-bitcoin": "BINANCE:WBTCUSDT",
    "wrapped-ether": "BINANCE:WETHUSDT",
    "wrapped-steth": "BYBIT:WSTETHUSDT",
    # Exchange tokens not on Binance
    "whitebit": "BYBIT:WBTUSDT",
    "leo-token": "BYBIT:LEOUSDT",
    "okb": "OKX:OKBUSDT",
    "cronos": "BYBIT:CROUSDT",
    # DeFi / others
    "figure-heloc": "BYBIT:FIGUSDT",
    "hyperliquid": "BYBIT:HYPEUSDT",
    "mantra-dao": "BINANCE:OMUSDT",
    "virtual-protocol": "BINANCE:VIRTUALUSDT",
    "kaspa": "BYBIT:KASUSDT",
    "bittensor": "BYBIT:TAOUSDT",
    "internet-computer": "BINANCE:ICPUSDT",
    "hedera-hashgraph": "BINANCE:HBARUSDT",
    "vechain": "BINANCE:VETUSDT",
    "the-graph": "BINANCE:GRTUSDT",
    "theta-token": "BINANCE:THETAUSDT",
    "monero": "KRAKEN:XMRUSD",
    "algorand": "BINANCE:ALGOUSDT",
    "fantom": "BINANCE:FTMUSDT",
    "helium": "BINANCE:HNTUSDT",
    "flow": "BINANCE:FLOWUSDT",
    "decentraland": "BINANCE:MANAUSDT",
    "the-sandbox": "BINANCE:SANDUSDT",
    "axie-infinity": "BINANCE:AXSUSDT",
    "gala": "BINANCE:GALAUSDT",
    "chiliz": "BINANCE:CHZUSDT",
    "enjincoin": "BINANCE:ENJUSDT",
    "basic-attention-token": "BINANCE:BATUSDT",
    "1inch": "BINANCE:1INCHUSDT",
    "curve-dao-token": "BINANCE:CRVUSDT",
    "compound-governance-token": "BINANCE:COMPUSDT",
    "maker": "BINANCE:MKRUSDT",
    "yearn-finance": "BINANCE:YFIUSDT",
    "sushi": "BINANCE:SUSHIUSDT",
    "balancer": "BINANCE:BALUSDT",
    "pancakeswap-token": "BINANCE:CAKEUSDT",
    "thorchain": "BINANCE:RUNEUSDT",
    "kava": "BINANCE:KAVAUSDT",
    "band-protocol": "BINANCE:BANDUSDT",
    "ocean-protocol": "BINANCE:OCEANUSDT",
    "ren": "BINANCE:RENUSDT",
    "origin-protocol": "BYBIT:OGNUSDT",
    "woo-network": "BINANCE:WOOUSDT",
    "dydx": "BINANCE:DYDXUSDT",
    "gmx": "BINANCE:GMXUSDT",
    "blur": "BINANCE:BLURUSDT",
    "immutable-x": "BINANCE:IMXUSDT",
    "bittorrent": "BINANCE:BTTCUSDT",
    "conflux-token": "BINANCE:CFXUSDT",
    "stepn": "BINANCE:GMTUSDT",
    "spell-token": "BYBIT:SPELLUSDT",
    "terra-luna-2": "BINANCE:LUNAUSDT",
    "elrond-erd-2": "BINANCE:EGLDUSDT",
    "harmony": "BINANCE:ONEUSDT",
    "zilliqa": "BINANCE:ZILUSDT",
    "iota": "BINANCE:IOTAUSDT",
    "neo": "BINANCE:NEOUSDT",
    "qtum": "BINANCE:QTUMUSDT",
    "icon": "BINANCE:ICXUSDT",
    "ontology": "BINANCE:ONTUSDT",
    "waves": "BINANCE:WAVESUSDT",
    "nano": "BINANCE:NANOUSDT",
    "digibyte": "BYBIT:DGBUSDT",
    "horizen": "BYBIT:ZENUSDT",
    "syscoin": "BYBIT:SYSUSDT",
}


def fetch_top_coins(target=100):
    """Fetch enough coins from CoinGecko to get `target` non-stablecoin coins."""
    result = []
    page = 1
    while len(result) < target:
        url = (f"https://api.coingecko.com/api/v3/coins/markets"
               f"?vs_currency=usd&order=market_cap_desc&per_page=100&page={page}&sparkline=false")
        for attempt in range(3):
            r = requests.get(url, timeout=15)
            if r.status_code == 429:
                print(f"  rate limited, waiting 30s...")
                time.sleep(30)
                continue
            data = r.json()
            if isinstance(data, list) and len(data) > 0:
                for coin in data:
                    if coin["id"] not in SKIP_COINS and len(result) < target:
                        result.append(coin)
                break
            time.sleep(10)
        else:
            break
        if len(result) < target:
            page += 1
            time.sleep(2)
    print(f"  Fetched {len(result)} non-stablecoin coins (pages: {page})")
    return result


def fetch_ohlcv(coin_id: str, days=365):
    url = (f"https://api.coingecko.com/api/v3/coins/{coin_id}/market_chart"
           f"?vs_currency=usd&days={days}&interval=daily")
    for attempt in range(3):
        try:
            r = requests.get(url, timeout=15)
            if r.status_code == 429:
                print(f"    rate limited, waiting 30s...")
                time.sleep(30)
                continue
            data = r.json()
            if "prices" not in data or len(data["prices"]) < 30:
                return None
            prices = [p[1] for p in data["prices"]]
            # market_chart only gives close prices — approximate OHLC from close
            return {
                "open":  prices,
                "high":  prices,
                "low":   prices,
                "close": prices,
            }
        except Exception as e:
            print(f"    fetch error: {e}, retry {attempt+1}/3")
            time.sleep(5)
    return None


def calc_rsi(close, period=14):
    deltas = [close[i] - close[i-1] for i in range(1, len(close))]
    gains  = [max(d, 0) for d in deltas]
    losses = [abs(min(d, 0)) for d in deltas]
    avg_g = sum(gains[:period]) / period
    avg_l = sum(losses[:period]) / period
    rs = avg_g / avg_l if avg_l else 100
    return round(100 - (100 / (1 + rs)), 2)


def calc_ema(data, period):
    k = 2 / (period + 1)
    ema = [data[0]]
    for price in data[1:]:
        ema.append(price * k + ema[-1] * (1 - k))
    return ema


def detect_sr(highs, lows, n=10):
    support, resistance = [], []
    for i in range(n, len(lows) - n):
        if lows[i] == min(lows[i-n:i+n]):
            support.append(round(lows[i], 4))
        if highs[i] == max(highs[i-n:i+n]):
            resistance.append(round(highs[i], 4))

    def dedup(levels):
        result = []
        for lv in sorted(levels):
            if not result or (lv - result[-1]) / result[-1] > 0.02:
                result.append(lv)
        return result

    s = dedup(support)
    r = dedup(resistance)
    return s[-3:] if len(s) > 3 else s, r[:3] if len(r) > 3 else r


def analyze_coin(coin, ohlcv):
    close = ohlcv["close"]
    highs = ohlcv["high"]
    lows  = ohlcv["low"]
    rsi   = calc_rsi(close)
    ema20 = calc_ema(close, 20)
    ema50 = calc_ema(close, 50)
    golden_cross = ema20[-1] > ema50[-1]
    ema_cross    = "Golden Cross" if golden_cross else "Death Cross"
    diff_pct     = (ema20[-1] - ema50[-1]) / ema50[-1] * 100
    trend = "Bullish" if diff_pct > 1.5 else "Bearish" if diff_pct < -1.5 else "Sideways"
    support, resistance = detect_sr(highs, lows)
    score = 50
    if rsi < 65 and golden_cross: score += 20
    if rsi < 30: score += 10
    if rsi > 70: score -= 15
    if not golden_cross: score -= 15
    score  = max(10, min(95, score))
    signal = "buy" if score >= 60 else "sell" if score <= 40 else "neutral"
    macd_val = "Positif" if close[-1] > ema50[-1] else "Negatif"
    return {
        "signal": signal, "score": score, "trend": trend,
        "rsi": rsi, "macd": macd_val, "ema_cross": ema_cross,
        "support":    [{"price": s, "strength": "strong"} for s in support],
        "resistance": [{"price": r, "strength": "medium"} for r in resistance],
    }


def generate_narasi(coin_name: str, analysis: dict) -> str:
    prompt = (
        f"Write a 2-sentence market analysis for {coin_name} in plain English. "
        f"Data: RSI={analysis['rsi']}, trend={analysis['trend']}, "
        f"signal={analysis['signal']}, ema={analysis['ema_cross']}, "
        f"support={analysis['support']}, resistance={analysis['resistance']}. "
        "Mention the most important S&R levels. Keep it simple, no jargon."
    )
    msg = ai_client.chat.completions.create(
        model="deepseek/deepseek-v3.2",
        max_tokens=200,
        messages=[{"role": "user", "content": prompt}],
    )
    return msg.choices[0].message.content


def run():
    sb    = create_client(SUPABASE_URL, SUPABASE_KEY)
    coins = fetch_top_coins(target=100)
    print(f"Processing {len(coins)} coins...")

    for i, coin in enumerate(coins):
        name = coin['name'].encode('ascii', 'replace').decode()
        try:
            if i > 0:
                time.sleep(8)  # CoinGecko free tier: ~7 req/min safe

            print(f"[{i+1}/{len(coins)}] {name}...")
            ohlcv = fetch_ohlcv(coin["id"])
            if not ohlcv:
                print(f"  SKIP {name}: no price data")
                continue

            analysis = analyze_coin(coin, ohlcv)
            narasi   = generate_narasi(coin["name"], analysis)

            record = {
                "coin_id":           coin["id"],
                "name":              coin["name"],
                "symbol":            coin["symbol"].upper(),
                "image_url":         coin["image"],
                "current_price":     coin["current_price"],
                "price_change_24h":  coin.get("price_change_percentage_24h", 0),
                "market_cap_rank":   coin.get("market_cap_rank", i + 1),
                "signal":            analysis["signal"],
                "score":             analysis["score"],
                "trend":             analysis["trend"],
                "rsi":               analysis["rsi"],
                "macd":              analysis["macd"],
                "ema_cross":         analysis["ema_cross"],
                "support":           analysis["support"],
                "resistance":        analysis["resistance"],
                "narasi":            narasi,
                "tv_symbol":         TV_SYMBOL_MAP.get(coin["id"], f"BINANCE:{coin['symbol'].upper()}USDT"),
            }
            sb.table("coin_analysis").upsert(record).execute()
            print(f"  OK {name}: {analysis['signal'].upper()} ({analysis['score']}/100)")

        except Exception as e:
            print(f"  ERR {name}: {str(e)[:80]}")

    print("\nDone! Database updated.")


if __name__ == "__main__":
    run()
