import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { fetchMarketBatch } from '@/lib/cron/coingecko'

export const maxDuration = 60
export const dynamic = 'force-dynamic'

// Lightweight cron — only updates current_price + price_change_24h.
// Does NOT re-run TA or call AI. Safe to run every hour.
export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const coins = await prisma.coin.findMany({
    where: { is_active: true },
    select: { coin_id: true },
  })

  const coinIds = coins.map(c => c.coin_id)
  const marketMap = await fetchMarketBatch(coinIds)

  let updated = 0
  let skipped = 0

  for (const [coinId, mkt] of marketMap) {
    try {
      await prisma.coin.update({
        where: { coin_id: coinId },
        data: {
          marketcap_usd: mkt.market_cap,
          market_cap_rank: mkt.market_cap_rank,
        },
      })

      // Update current_price on the latest analysis for this coin
      const latest = await prisma.analysis.findFirst({
        where: { coin_id: coinId },
        orderBy: { generated_at: 'desc' },
        select: { id: true },
      })
      if (latest) {
        await prisma.analysis.update({
          where: { id: latest.id },
          data: {
            current_price: mkt.current_price,
            price_change_24h: mkt.price_change_percentage_24h,
          },
        })
      }

      console.log(`OK: ${coinId}`);
      updated++
    } catch (err) {
      console.error(`ERR: ${coinId}`, err);
      skipped++
    }
  }

  return NextResponse.json({
    total: coinIds.length,
    updated,
    skipped,
    market_fetched: marketMap.size,
  })
}
