import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { fetchMarketBatch } from '@/lib/cron/coingecko'

export const maxDuration = 10
export const dynamic = 'force-dynamic'

const PRICES_BATCH_SIZE = 25

// Lightweight cron — only updates current_price + price_change_24h.
// Does NOT re-run TA or call AI. Batched with cursor so it fits inside
// Vercel Hobby's 10s function timeout.
export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // ── 1. Read batch cursor ──
  const cursorRow = await prisma.cronState.upsert({
    where:  { key: 'refresh_prices_cursor' },
    create: { key: 'refresh_prices_cursor', value: { offset: 0 } },
    update: {},
  })
  const offset = (cursorRow.value as { offset: number }).offset ?? 0

  // ── 2. Load this batch of coins ──
  const coins = await prisma.coin.findMany({
    where:   { is_active: true },
    orderBy: { market_cap_rank: 'asc' },
    skip:    offset,
    take:    PRICES_BATCH_SIZE,
    select:  { coin_id: true },
  })

  if (coins.length === 0) {
    await prisma.cronState.update({
      where: { key: 'refresh_prices_cursor' },
      data:  { value: { offset: 0 } },
    })
    return NextResponse.json({ done: true, message: 'Full cycle complete, cursor reset.' })
  }

  const coinIds = coins.map(c => c.coin_id)

  // ── 3. Fetch market data for this batch only ──
  const marketMap = await fetchMarketBatch(coinIds)

  // ── 4. Pre-fetch latest analysis IDs in one query ──
  const latestAnalyses = await prisma.analysis.findMany({
    where:    { coin_id: { in: coinIds } },
    orderBy:  { generated_at: 'desc' },
    distinct: ['coin_id'],
    select:   { id: true, coin_id: true },
  })
  const latestMap = new Map(latestAnalyses.map(a => [a.coin_id, a.id]))

  // ── 5. Build batched DB operations ──
  let updated = 0
  let skipped = 0

  const coinOps: ReturnType<typeof prisma.coin.update>[] = []
  const analysisOps: ReturnType<typeof prisma.analysis.update>[] = []

  for (const { coin_id } of coins) {
    const mkt = marketMap.get(coin_id)
    if (!mkt) {
      skipped++
      continue
    }

    coinOps.push(
      prisma.coin.update({
        where: { coin_id },
        data:  { marketcap_usd: mkt.market_cap, market_cap_rank: mkt.market_cap_rank },
      })
    )

    const analysisId = latestMap.get(coin_id)
    if (analysisId) {
      analysisOps.push(
        prisma.analysis.update({
          where: { id: analysisId },
          data:  { current_price: mkt.current_price, price_change_24h: mkt.price_change_percentage_24h },
        })
      )
    }

    updated++
  }

  await prisma.$transaction([...coinOps, ...analysisOps])

  // ── 6. Advance cursor ──
  const nextOffset = offset + coins.length
  await prisma.cronState.update({
    where: { key: 'refresh_prices_cursor' },
    data:  { value: { offset: nextOffset } },
  })

  return NextResponse.json({
    total:          coins.length,
    updated,
    skipped,
    market_fetched: marketMap.size,
    offset_before:  offset,
    offset_after:   nextOffset,
  })
}
