import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

let cache: { price: number; change24h: number; ts: number } | null = null
const TTL = 15_000 // 15s

export async function GET() {
  if (cache && Date.now() - cache.ts < TTL) {
    return NextResponse.json(cache)
  }

  try {
    const res = await fetch(
      'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd&include_24hr_change=true',
      { cache: 'no-store' }
    )
    if (!res.ok) throw new Error(`CoinGecko ${res.status}`)
    const json = await res.json() as { bitcoin: { usd: number; usd_24h_change: number } }
    cache = { price: json.bitcoin.usd, change24h: json.bitcoin.usd_24h_change, ts: Date.now() }
    return NextResponse.json(cache)
  } catch {
    if (cache) return NextResponse.json(cache)
    return NextResponse.json({ price: null, change24h: null }, { status: 503 })
  }
}
