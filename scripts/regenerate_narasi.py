"""
CryptoLens — Narasi-Only Regeneration Script
Run: python scripts/regenerate_narasi.py

Updates ONLY the `narasi` field in English for all existing coins.
Does NOT re-fetch prices or re-run technical analysis.
Much faster than full re-run (~3-5 min vs 2 hrs).
"""

import os, sys, time
from openai import OpenAI
from supabase import create_client

sys.stdout.reconfigure(encoding='utf-8')

SUPABASE_URL   = os.environ["SUPABASE_URL"]
SUPABASE_KEY   = os.environ["SUPABASE_SERVICE_KEY"]
OPENROUTER_KEY = os.environ["OPENROUTER_API_KEY"]

ai = OpenAI(base_url="https://openrouter.ai/api/v1", api_key=OPENROUTER_KEY)
sb = create_client(SUPABASE_URL, SUPABASE_KEY)


def generate_narasi(name: str, rsi, trend, signal, ema_cross, support, resistance) -> str:
    prompt = (
        f"Write a 2-sentence market analysis for {name} in plain English. "
        f"Data: RSI={rsi}, trend={trend}, signal={signal}, ema={ema_cross}, "
        f"support={support}, resistance={resistance}. "
        "Mention the most important S&R levels. Keep it simple, no jargon."
    )
    msg = ai.chat.completions.create(
        model="deepseek/deepseek-v3.2",
        max_tokens=200,
        messages=[{"role": "user", "content": prompt}],
    )
    return msg.choices[0].message.content.strip()


def run():
    res = sb.table("coin_analysis").select(
        "coin_id, name, rsi, trend, signal, ema_cross, support, resistance"
    ).order("market_cap_rank").execute()

    coins = res.data
    print(f"Regenerating narasi for {len(coins)} coins in English...")

    for i, coin in enumerate(coins):
        name = coin["name"].encode("ascii", "replace").decode()
        try:
            narasi = generate_narasi(
                coin["name"],
                coin["rsi"], coin["trend"], coin["signal"],
                coin["ema_cross"], coin["support"], coin["resistance"],
            )
            sb.table("coin_analysis").update({"narasi": narasi}).eq("coin_id", coin["coin_id"]).execute()
            print(f"  [{i+1}/{len(coins)}] {name}: OK")
            time.sleep(1)  # OpenRouter rate limit buffer
        except Exception as e:
            print(f"  [{i+1}/{len(coins)}] {name}: ERR {str(e)[:60]}")

    print("\nDone! All narasi updated to English.")


if __name__ == "__main__":
    run()
