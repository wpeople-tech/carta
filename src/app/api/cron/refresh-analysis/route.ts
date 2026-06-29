import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import { prisma } from '@/lib/prisma'
import { fetchOhlcv, fetchMarketBatch } from '@/lib/cron/coingecko'
import { computeTechnicalAnalysis, buildNarasiPrompt } from '@/lib/cron/analysis'
import { BATCH_SIZE, ANALYSIS_TTL_HOURS, COINGECKO_DELAY_MS } from '@/lib/cron/constants'

export const maxDuration = 300  // Vercel Pro max (seconds)
export const dynamic = 'force-dynamic'

const ai = new OpenAI({
  baseURL: 'https://openrouter.ai/api/v1',
  apiKey: process.env.OPENROUTER_API_KEY!,
})

function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

export async function GET(req: NextRequest) {
  // Vercel cron injects Authorization header — verify it
  const authHeader = req.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // ── 1. Read batch cursor ──
  const cursorRow = await prisma.cronState.upsert({
    where: { key: 'refresh_analysis_cursor' },
    create: { key: 'refresh_analysis_cursor', value: { offset: 0 } },
    update: {},
  })
  const cursor = cursorRow.value as { offset: number }
  const offset = cursor.offset ?? 0

  // ── 2. Load active coins for this batch ──
  const coins = await prisma.coin.findMany({
    where: { is_active: true },
    orderBy: { market_cap_rank: 'asc' },
    skip: offset,
    take: BATCH_SIZE,
  })

  if (coins.length === 0) {
    // Full cycle done — reset cursor to 0
    await prisma.cronState.update({
      where: { key: 'refresh_analysis_cursor' },
      data: { value: { offset: 0 } },
    })
    return NextResponse.json({ done: true, message: 'Full cycle complete, cursor reset.' })
  }

  // ── 3. Fetch fresh market prices in one batch call ──
  const marketMap = await fetchMarketBatch(coins.map(c => c.coin_id))

  // ── 4. Fetch latest analysis for each coin (untuk skip-if-unchanged check) ──
  const latestAnalyses = await prisma.analysis.findMany({
    where: { coin_id: { in: coins.map(c => c.coin_id) } },
    orderBy: { generated_at: 'desc' },
    distinct: ['coin_id'],
    select: { coin_id: true, signal: true, signal_prev: true, trend_prev: true },
  })
  const latestMap = new Map(latestAnalyses.map(a => [a.coin_id, a]))

  const results: Record<string, string> = {}

  for (let i = 0; i < coins.length; i++) {
    const coin = coins[i]
    if (i > 0) await sleep(COINGECKO_DELAY_MS)

    try {
      const mkt = marketMap.get(coin.coin_id)
      const ohlcv = await fetchOhlcv(coin.coin_id)
      if (!ohlcv) {
        results[coin.coin_id] = 'SKIP: no ohlcv'
        continue
      }

      const ta = computeTechnicalAnalysis(ohlcv)
      const latest = latestMap.get(coin.coin_id)
      const currentPrice = mkt?.current_price ?? 0

      // ── 5. Skip AI call if signal + trend unchanged ──
      const signalUnchanged = latest?.signal === ta.signal
      const trendUnchanged = latest?.trend_prev === ta.trend
      let claudeCall: string

      if (signalUnchanged && trendUnchanged && latest) {
        // Reuse last claude_call — fetch it
        const prev = await prisma.analysis.findFirst({
          where: { coin_id: coin.coin_id },
          orderBy: { generated_at: 'desc' },
          select: { claude_call: true },
        })
        claudeCall = prev?.claude_call ?? ''
      } else {
        // Generate new narrative via OpenRouter
        const prompt = buildNarasiPrompt(coin.name, ta, currentPrice)
        const msg = await ai.chat.completions.create({
          model: 'deepseek/deepseek-v3.2',
          max_tokens: 200,
          messages: [{ role: 'user', content: prompt }],
        })
        claudeCall = msg.choices[0].message.content?.trim() ?? ''
      }

      const now = new Date()
      const expiresAt = new Date(now.getTime() + ANALYSIS_TTL_HOURS * 60 * 60 * 1000)

      // ── 6. Upsert analysis + related records ──
      await prisma.$transaction(async (tx) => {
        const analysis = await tx.analysis.create({
          data: {
            coin_id: coin.coin_id,
            current_price: currentPrice,
            price_change_24h: mkt?.price_change_percentage_24h ?? 0,
            signal: ta.signal,
            confidence_pct: ta.confidence_pct,
            weekly_bias: ta.signal === 'BUY' ? 'BULLISH' : ta.signal === 'SELL' ? 'BEARISH' : 'NEUTRAL',
            claude_call: claudeCall,
            signal_prev: latest?.signal ?? null,
            trend_prev: ta.trend,
            generated_at: now,
            expires_at: expiresAt,
          },
        })

        // S/R levels
        const srData = [
          ...ta.resistance.map((price, i) => ({
            analysis_id: analysis.id,
            level_type: 'RESISTANCE' as const,
            strength: i === 0 ? 'STRONG' as const : 'WEAK' as const,
            price,
            sort_order: i,
          })),
          ...ta.support.map((price, i) => ({
            analysis_id: analysis.id,
            level_type: 'SUPPORT' as const,
            strength: i === ta.support.length - 1 ? 'STRONG' as const : 'WEAK' as const,
            price,
            sort_order: i,
          })),
        ]
        if (srData.length) await tx.supportResistance.createMany({ data: srData })

        // Indicators
        await tx.indicator.create({
          data: {
            analysis_id: analysis.id,
            rsi_value: ta.rsi,
            rsi_status: ta.rsi_status,
            macd_line: ta.macd_line,
            macd_signal: ta.macd_signal_line,
            macd_histogram: ta.macd_histogram,
            macd_cross: ta.macd_cross,
            ema20: ta.ema20,
            ema200: ta.ema200,
            price_vs_ema20: ta.price_vs_ema20,
            price_vs_ema200: ta.price_vs_ema200,
            bb_upper: ta.bb_upper,
            bb_middle: ta.bb_middle,
            bb_lower: ta.bb_lower,
            bb_status: ta.bb_status,
            atr_value: ta.atr_value,
            volume_status: ta.volume_status,
          },
        })

        // Trade setups — placeholder grade B setups derived from S/R
        const closestSupport = ta.support[ta.support.length - 1]
        const closestResistance = ta.resistance[0]
        if (closestSupport && closestResistance) {
          const entryLow = closestSupport * 1.005
          const entryHigh = closestSupport * 1.015
          const stopTight = closestSupport * 0.985
          const stopSafe = closestSupport * 0.97
          const tp1 = currentPrice + (currentPrice - closestSupport) * 1.5
          const tp2 = currentPrice + (currentPrice - closestSupport) * 2.5
          const tp3 = closestResistance

          await tx.tradeSetup.createMany({
            data: [
              {
                analysis_id: analysis.id,
                direction: 'LONG',
                grade: ta.signal === 'BUY' ? 'A' : 'B',
                conviction: ta.confidence_pct >= 70 ? 'HIGH' : ta.confidence_pct >= 55 ? 'MEDIUM' : 'LOW',
                entry_zone_low: entryLow,
                entry_zone_high: entryHigh,
                stop_tight: stopTight,
                stop_safe: stopSafe,
                risk_pct_tight: ((entryLow - stopTight) / entryLow) * 100,
                risk_pct_safe: ((entryLow - stopSafe) / entryLow) * 100,
                tp1_price: tp1,
                tp1_rr: (tp1 - entryLow) / (entryLow - stopTight),
                tp2_price: tp2,
                tp2_rr: (tp2 - entryLow) / (entryLow - stopTight),
                tp3_price: tp3,
                tp3_rr: (tp3 - entryLow) / (entryLow - stopTight),
                trigger_note: `Break and close above ${entryHigh.toFixed(4)}`,
                invalidation: `Daily close below ${stopSafe.toFixed(4)}`,
                setup_note: null,
              },
            ],
          })
        }

        // Update coin price metadata
        await tx.coin.update({
          where: { coin_id: coin.coin_id },
          data: {
            market_cap_rank: mkt?.market_cap_rank ?? coin.market_cap_rank,
            marketcap_usd: mkt?.market_cap ?? coin.marketcap_usd,
          },
        })
      })

      const aiUsed = !(signalUnchanged && trendUnchanged && latest)
      results[coin.coin_id] = `OK ${ta.signal} ${ta.confidence_pct}/100 AI=${aiUsed}`
    } catch (err) {
      results[coin.coin_id] = `ERR: ${String(err).slice(0, 80)}`
    }
  }

  // ── 7. Advance cursor ──
  const nextOffset = offset + coins.length
  await prisma.cronState.update({
    where: { key: 'refresh_analysis_cursor' },
    data: { value: { offset: nextOffset } },
  })

  return NextResponse.json({
    processed: coins.length,
    offset_before: offset,
    offset_after: nextOffset,
    results,
  })
}
