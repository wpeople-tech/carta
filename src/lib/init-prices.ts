/**
 * init-prices.ts
 * Calls /api/cron/refresh-prices repeatedly until all coins are processed
 * (cursor resets to 0 and returns done: true).
 *
 * Run while `next dev` is active (or point INIT_BASE_URL at your deployed URL).
 *
 * Usage: npx tsx src/lib/init-prices.ts
 */

import 'dotenv/config'

const BASE_URL = process.env.INIT_BASE_URL ?? 'http://localhost:3000'
const CRON_SECRET = process.env.CRON_SECRET!

if (!CRON_SECRET) {
  console.error('CRON_SECRET is not set in .env')
  process.exit(1)
}

const headers = { Authorization: `Bearer ${CRON_SECRET}` }

// Small pause between ticks — refresh-prices is fast (~2–3s per batch).
const TICK_PAUSE_MS = 5_000

async function callRefreshPrices(): Promise<{
  done?: boolean
  total?: number
  updated: number
  skipped: number
  market_fetched?: number
  offset_before?: number
  offset_after?: number
  message?: string
}> {
  const r = await fetch(`${BASE_URL}/api/cron/refresh-prices`, { headers })
  if (!r.ok) throw new Error(`HTTP ${r.status}: ${await r.text()}`)
  return r.json()
}

function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

async function main() {
  console.log(`Init prices — target: ${BASE_URL}`)
  console.log('Make sure `next dev` is running (or set INIT_BASE_URL to your deployed URL)\n')

  let tick = 1

  while (true) {
    console.log(`── Tick ${tick} ──────────────────────────────────`)

    let res
    try {
      res = await callRefreshPrices()
    } catch (err) {
      console.error(`  Request failed: ${err}`)
      console.log(`  Retrying in 5s...`)
      await sleep(5_000)
      continue
    }

    if (res.done) {
      console.log('  Full cycle complete — all prices updated.')
      break
    }

    console.log(`  Updated : ${res.updated} | Skipped: ${res.skipped}`)
    console.log(`  Cursor  : ${res.offset_before} → ${res.offset_after}`)

    if (!BASE_URL.includes('http://localhost:')) await sleep(TICK_PAUSE_MS)
    tick++
  }

  console.log('\nInit prices complete.')
}

main().catch(err => {
  console.error(err)
  process.exit(1)
})
