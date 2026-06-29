/**
 * init-analysis.ts
 * Calls /api/cron/refresh-analysis repeatedly until all coins are processed
 * (cursor resets to 0), then calls /api/cron/refresh-prices once.
 *
 * Run while `next dev` is active (or point BASE_URL at your deployed URL).
 *
 * Usage: npx tsx scripts/init-analysis.ts
 */

import 'dotenv/config'

const BASE_URL   = process.env.INIT_BASE_URL ?? 'http://localhost:3000'
const CRON_SECRET = process.env.CRON_SECRET!

if (!CRON_SECRET) {
  console.error('CRON_SECRET is not set in .env')
  process.exit(1)
}

const headers = {
  Authorization: `Bearer ${CRON_SECRET}`,
}

// Pause between ticks to respect CoinGecko rate limit.
// Each batch of 10 coins takes ~80s internally (8s × 10).
// We add 10s buffer on top.
const TICK_PAUSE_MS = 90_000

async function callRefreshAnalysis(): Promise<{
  done?: boolean
  processed?: number
  offset_before?: number
  offset_after?: number
  results?: Record<string, string>
}> {
  const r = await fetch(`${BASE_URL}/api/cron/refresh-analysis`, { headers })
  if (!r.ok) throw new Error(`HTTP ${r.status}: ${await r.text()}`)
  return r.json()
}

async function callRefreshPrices(): Promise<{ updated: number; skipped: number }> {
  const r = await fetch(`${BASE_URL}/api/cron/refresh-prices`, { headers })
  if (!r.ok) throw new Error(`HTTP ${r.status}: ${await r.text()}`)
  return r.json()
}

function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

async function main() {
  console.log(`Init analysis — target: ${BASE_URL}`)
  console.log('Make sure `next dev` is running (or set INIT_BASE_URL to your deployed URL)\n')

  let tick = 1

  while (true) {
    console.log(`── Tick ${tick} ──────────────────────────────────`)

    let res
    try {
      res = await callRefreshAnalysis()
    } catch (err) {
      console.error(`  Request failed: ${err}`)
      console.log(`  Retrying in 15s...`)
      await sleep(15_000)
      continue
    }

    if (res.done) {
      console.log('  Full cycle complete — all coins processed.')
      break
    }

    console.log(`  Processed : ${res.processed} coins`)
    console.log(`  Cursor    : ${res.offset_before} → ${res.offset_after}`)
    if (res.results) {
      for (const [id, status] of Object.entries(res.results)) {
        console.log(`    ${id.padEnd(32)} ${status}`)
      }
    }

    console.log(`\n  Waiting ${TICK_PAUSE_MS / 1000}s before next tick...\n`)
    await sleep(TICK_PAUSE_MS)
    tick++
  }

  // Final price refresh to make sure prices are current
  console.log('\n── Refreshing prices ────────────────────────')
  try {
    const prices = await callRefreshPrices()
    console.log(`  Updated: ${prices.updated} | Skipped: ${prices.skipped}`)
  } catch (err) {
    console.error(`  Price refresh failed: ${err}`)
  }

  console.log('\nInit complete. Cron will handle updates from here.')
}

main().catch(err => {
  console.error(err)
  process.exit(1)
})
