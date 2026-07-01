import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET() {
  const coins = await prisma.coin.findMany({
    where: { is_active: true },
    orderBy: { market_cap_rank: 'asc' },
    take: 150,
    select: {
      coin_id: true,
      symbol: true,
      name: true,
      image_url: true,
      market_cap_rank: true,
      marketcap_usd: true,
      analyses: {
        orderBy: { generated_at: 'desc' },
        take: 1,
        select: {
          signal: true,
          confidence_pct: true,
          current_price: true,
          price_change_24h: true,
          weekly_bias: true,
          generated_at: true,
        },
      },
    },
  })

  const result = coins.map(c => ({
    coin_id: c.coin_id,
    symbol: c.symbol,
    name: c.name,
    image_url: c.image_url,
    market_cap_rank: c.market_cap_rank,
    marketcap_usd: c.marketcap_usd,
    signal: c.analyses[0]?.signal ?? null,
    confidence_pct: c.analyses[0]?.confidence_pct ?? null,
    current_price: c.analyses[0]?.current_price ?? null,
    price_change_24h: c.analyses[0]?.price_change_24h ?? null,
    weekly_bias: c.analyses[0]?.weekly_bias ?? null,
    generated_at: c.analyses[0]?.generated_at ?? null,
  }))

  return NextResponse.json(result)
}
