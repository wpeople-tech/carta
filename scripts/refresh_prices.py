"""
refresh_prices.py
Fetch live prices from CoinGecko and update current_price + price_change_24h in Supabase.
Run once to fix stale price data without touching signals, S/R, or narasi.
"""

import os, time, requests
from supabase import create_client

SUPABASE_URL = "https://bpbtgkunrdzcoyfdhskh.supabase.co"
SUPABASE_KEY = os.environ.get("SUPABASE_SERVICE_KEY", "")

DOTENV_PATH = os.path.join(os.path.dirname(__file__), "..", ".env.local")
if not SUPABASE_KEY and os.path.exists(DOTENV_PATH):
    for line in open(DOTENV_PATH):
        line = line.strip()
        if line.startswith("SUPABASE_SERVICE_KEY="):
            SUPABASE_KEY = line.split("=", 1)[1]

if not SUPABASE_KEY:
    raise SystemExit("SUPABASE_SERVICE_KEY not found")

sb = create_client(SUPABASE_URL, SUPABASE_KEY)

# 1. Fetch all coin_ids from DB
print("Fetching coin list from Supabase...")
rows = sb.table("coin_analysis").select("coin_id").execute().data
coin_ids = [r["coin_id"] for r in rows]
print(f"  Found {len(coin_ids)} coins")

# 2. Fetch live prices from CoinGecko in batches of 50
def fetch_prices(ids: list[str]) -> dict:
    prices = {}
    batch_size = 50
    for i in range(0, len(ids), batch_size):
        batch = ids[i:i+batch_size]
        url = (
            "https://api.coingecko.com/api/v3/coins/markets"
            "?vs_currency=usd"
            f"&ids={','.join(batch)}"
            "&order=market_cap_desc&per_page=50&page=1&sparkline=false"
        )
        for attempt in range(3):
            r = requests.get(url, timeout=15)
            if r.status_code == 429:
                print("  Rate limited, waiting 30s...")
                time.sleep(30)
                continue
            if r.status_code == 200:
                for coin in r.json():
                    prices[coin["id"]] = {
                        "current_price":    coin.get("current_price", 0),
                        "price_change_24h": coin.get("price_change_percentage_24h", 0),
                    }
                break
        time.sleep(1.2)  # respect rate limit
    return prices

print("Fetching live prices from CoinGecko...")
prices = fetch_prices(coin_ids)
print(f"  Got prices for {len(prices)} coins")

# 3. Update Supabase
print("Updating Supabase...")
updated = 0
skipped = 0
for coin_id in coin_ids:
    if coin_id not in prices:
        print(f"  SKIP {coin_id} — not found in CoinGecko response")
        skipped += 1
        continue
    p = prices[coin_id]
    sb.table("coin_analysis").update({
        "current_price":    p["current_price"],
        "price_change_24h": p["price_change_24h"],
    }).eq("coin_id", coin_id).execute()
    print(f"  OK {coin_id}: ${p['current_price']:,.4f} ({p['price_change_24h']:+.2f}%)")
    updated += 1

print(f"\nDone. Updated: {updated} | Skipped: {skipped}")
