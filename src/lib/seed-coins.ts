/**
 * seed-coins.ts
 * Fetches top 100 non-stablecoin coins from CoinGecko and populates the `coins` table.
 * Run once before the first refresh-analysis cron.
 *
 * Usage: npx tsx scripts/seed-coins.ts
 */

import 'dotenv/config'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '@/generated/prisma/client'
import { SKIP_COINS, TV_SYMBOL_MAP } from './cron/constants'

const connectionString = process.env.RUNTIME_DATABASE_URL ?? process.env.DATABASE_URL
if (!connectionString) {
  console.error('No DATABASE_URL found in environment')
  process.exit(1)
}
const adapter = new PrismaPg({ connectionString })
const prisma = new PrismaClient({ adapter })

const BASE = 'https://api.coingecko.com/api/v3'
const TARGET = 100
const RANK_CAP = 150

function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

async function fetchTopCoins() {
  const result = []
  let page = 1

  while (result.length < TARGET) {
    const url = `${BASE}/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=100&page=${page}&sparkline=false`
    console.log(`  Fetching page ${page}...`)

    for (let attempt = 0; attempt < 3; attempt++) {
      const r = await fetch(url, { signal: AbortSignal.timeout(15_000) })
      if (r.status === 429) {
        console.log('  Rate limited, waiting 30s...')
        await sleep(30_000)
        continue
      }
      if (!r.ok) break
      const data: any[] = await r.json()
      for (const coin of data) {
        if (SKIP_COINS.has(coin.id)) continue
        if ((coin.market_cap_rank ?? 999) > RANK_CAP) continue
        result.push(coin)
        if (result.length >= TARGET) break
      }
      break
    }

    if (result.length >= TARGET) break
    page++
    await sleep(1_500)
  }

  return result
}

async function verifyMigration() {
  try {
    await prisma.$queryRaw`SELECT 1 FROM coins LIMIT 1`
  } catch {
    console.error('\nERROR: Table "coins" does not exist.')
    console.error('Run migration first:  npx prisma migrate dev --name init\n')
    process.exit(1)
  }
}

async function main() {
  console.log(`Seeding coins table (target: ${TARGET} non-stablecoin coins)...\n`)

  await verifyMigration()

  const coins = await fetchTopCoins()
  console.log(`Fetched ${coins.length} coins from CoinGecko\n`)

  let inserted = 0
  let skipped = 0

  for (const coin of coins) {
    const tradingview_sym =
      TV_SYMBOL_MAP[coin.id] ?? `BINANCE:${coin.symbol.toUpperCase()}USDT`

    try {
      await prisma.coin.upsert({
        where: { coin_id: coin.id },
        create: {
          coin_id:         coin.id,
          symbol:          coin.symbol.toUpperCase(),
          name:            coin.name,
          tradingview_sym,
          image_url:       coin.image ?? null,
          marketcap_usd:   coin.market_cap ?? null,
          market_cap_rank: coin.market_cap_rank ?? null,
          is_active:       true,
        },
        update: {
          symbol:          coin.symbol.toUpperCase(),
          name:            coin.name,
          tradingview_sym,
          image_url:       coin.image ?? null,
          marketcap_usd:   coin.market_cap ?? null,
          market_cap_rank: coin.market_cap_rank ?? null,
          is_active:       true,
        },
      })
      console.log(`  OK  [${String(coin.market_cap_rank).padStart(3)}] ${coin.name.padEnd(30)} ${tradingview_sym}`)
      inserted++
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      console.log(`  ERR ${coin.name}: ${msg.slice(0, 120)}`)
      skipped++
    }
  }

  console.log(`\nDone. Inserted/updated: ${inserted} | Skipped: ${skipped}`)
  console.log('\nNext step: run  npx tsx scripts/init-analysis.ts')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
