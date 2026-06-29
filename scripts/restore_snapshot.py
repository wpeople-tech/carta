"""
restore_snapshot.py
Restores tv_symbol for all coins in coins_snapshot.json back to their
proven-valid values. Use this if any script accidentally overwrites tv_symbols.

Also removes any coins NOT in the snapshot (intruders) and flags missing ones.

Usage: python scripts/restore_snapshot.py [--dry-run]
"""
import os, sys, json, requests
sys.stdout.reconfigure(encoding="utf-8")

_DOTENV = os.path.join(os.path.dirname(__file__), "..", ".env.local")
if os.path.exists(_DOTENV):
    for l in open(_DOTENV):
        if "=" in l and not l.startswith("#"):
            k, v = l.strip().split("=", 1); os.environ.setdefault(k, v)

from supabase import create_client
sb = create_client(
    os.environ.get("SUPABASE_URL") or os.environ.get("NEXT_PUBLIC_SUPABASE_URL", ""),
    os.environ["SUPABASE_SERVICE_KEY"]
)

DRY_RUN = "--dry-run" in sys.argv
if DRY_RUN:
    print("DRY RUN — no changes will be made\n")

# Load snapshot
snap_path = os.path.join(os.path.dirname(__file__), "coins_snapshot.json")
with open(snap_path, encoding="utf-8") as f:
    snapshot = json.load(f)

snap_coins = {c["coin_id"]: c for c in snapshot["coins"]}
print(f"Snapshot: {snapshot['count']} coins, validated {snapshot['validated_at']}\n")

# Load DB
db_rows  = sb.table("coin_analysis").select("coin_id,tv_symbol").execute().data
db_coins = {r["coin_id"]: r["tv_symbol"] for r in db_rows}

# 1. Fix wrong tv_symbols
print("=== Checking tv_symbols ===")
fixed = 0
for coin_id, snap in snap_coins.items():
    db_tv = db_coins.get(coin_id)
    if db_tv is None:
        print(f"  MISSING  {coin_id} (not in DB — run refresh_analysis.py)")
    elif db_tv != snap["tv_symbol"]:
        print(f"  FIX      {coin_id}: {db_tv} -> {snap['tv_symbol']}")
        if not DRY_RUN:
            sb.table("coin_analysis").update({"tv_symbol": snap["tv_symbol"]}).eq("coin_id", coin_id).execute()
        fixed += 1
    else:
        pass  # OK

# 2. Find intruders (coins in DB but not in snapshot)
intruders = [cid for cid in db_coins if cid not in snap_coins]
print(f"\n=== Intruder coins (in DB, not in snapshot): {len(intruders)} ===")
for cid in intruders:
    print(f"  REMOVE   {cid} ({db_coins[cid]})")
    if not DRY_RUN:
        sb.table("coin_analysis").delete().eq("coin_id", cid).execute()

# 3. Verify via TradingView screener
print("\n=== TradingView verify ===")
current = sb.table("coin_analysis").select("coin_id,tv_symbol").execute().data
tickers = [r["tv_symbol"] for r in current]
resp = requests.post("https://scanner.tradingview.com/crypto/scan",
    json={"symbols": {"tickers": tickers, "query": {"types": []}}, "columns": ["close"]},
    headers={"User-Agent": "Mozilla/5.0"}, timeout=15)
found = {d["s"] for d in resp.json().get("data", [])}
broken = [r for r in current if r["tv_symbol"] not in found]
print(f"  {len(found)}/{len(current)} confirmed in TradingView")
if broken:
    print(f"  Still broken: {[r['coin_id'] for r in broken]}")
else:
    print("  All charts valid.")

print(f"\nDone. Fixed {fixed} tv_symbols | Removed {len(intruders)} intruders.")
if DRY_RUN:
    print("(DRY RUN — nothing was changed)")
