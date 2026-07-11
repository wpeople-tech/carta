import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import { prisma } from '@/lib/prisma'
import { fetchOhlcv, fetchMarketBatch } from '@/lib/cron/coingecko'
import {
  computeTechnicalAnalysis,
  computeMarketScore,
  calculateTradeSetup,
  validateAnalysis,
  buildInterpretationPrompt,
  type TradeSetupResult,
  type AIInterpretation,
  type MarketScore,
} from '@/lib/cron/analysis'
import { BATCH_SIZE, ANALYSIS_TTL_HOURS, COINGECKO_DELAY_MS, TV_SYMBOL_MAP } from '@/lib/cron/constants'

export const maxDuration = 300
export const dynamic = 'force-dynamic'

const ai = new OpenAI({
  baseURL: 'https://openrouter.ai/api/v1',
  apiKey: process.env.OPENROUTER_API_KEY!,
})

function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

function extractAndSanitizeJson(raw: string): string {
  // Strip markdown code fences
  let s = raw.replace(/^```(?:json)?\n?/m, '').replace(/\n?```$/m, '').trim()
  // Extract outermost JSON object
  const start = s.indexOf('{')
  const end = s.lastIndexOf('}')
  if (start !== -1 && end !== -1) s = s.slice(start, end + 1)
  // Strip non-ASCII annotations injected between ":" and the real value
  // e.g. `"confidence_pct": 補足説明: 40` → `"confidence_pct": 40`
  // Pattern: after a colon+space, any run of non-ASCII chars followed by another colon
  s = s.replace(/:\s*[^\x00-\x7F\s][^:"\[\{]*:\s*/g, ': ')
  // Quote bare unquoted non-numeric values after a colon — e.g. `"key": anj7` → `"key": "anj7"`
  // Matches: colon+space, then a token starting with a letter (not true/false/null), ending before comma/brace/newline
  s = s.replace(/:\s*([a-zA-Z][a-zA-Z0-9_]*)\s*([,\}\n])/g, (_, tok, term) => {
    if (tok === 'true' || tok === 'false' || tok === 'null') return `: ${tok}${term}`
    return `: "${tok}"${term}`
  })
  return s
}

async function callAI(
  coinName: string,
  currentPrice: number,
  ta: import('@/lib/cron/analysis').TechnicalAnalysis,
  setups: TradeSetupResult[],
  marketScore: MarketScore,
  client: OpenAI,
): Promise<AIInterpretation> {
  const prompt = buildInterpretationPrompt(coinName, currentPrice, ta, setups, marketScore)

  let parsed: AIInterpretation | null = null
  for (let attempt = 0; attempt < 2; attempt++) {
    const msg = await client.chat.completions.create({
      model: 'cohere/north-mini-code:free',
      max_tokens: 800,
      messages: [
        { role: 'system', content: 'Respond with valid JSON only. No annotations, no comments, no non-ASCII characters outside string values.' },
        { role: 'user', content: prompt },
      ],
    })
    const raw = msg.choices[0].message.content?.trim() ?? '{}'
    try {
      parsed = JSON.parse(extractAndSanitizeJson(raw)) as AIInterpretation
      break
    } catch (err) {
      console.warn(`[callAI] attempt ${attempt + 1} parse failed for ${coinName}:`, err)
      if (attempt === 1) {
        console.error(`[callAI] both attempts failed for ${coinName}. raw:\n${raw}`)
      }
    }
  }
  if (!parsed) {
    parsed = {
      confidence_pct: Math.min(75, marketScore.confidence_ceiling),
      setup_grades: { LONG: 'C', SHORT: 'C' },
      claude_call: 'Unable to parse AI interpretation. Using conservative defaults.',
    }
  }

  const confFloor = Math.min(75, marketScore.confidence_ceiling)
  parsed.confidence_pct = Math.min(Math.max(parsed.confidence_pct ?? confFloor, confFloor), marketScore.confidence_ceiling)
  return parsed
}

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization')
  return NextResponse.json({
    cronKey: authHeader
  })
  // if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
  //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  // }

  // // ── 1. Read batch cursor ──
  // const cursorRow = await prisma.cronState.upsert({
  //   where: { key: 'refresh_analysis_cursor' },
  //   create: { key: 'refresh_analysis_cursor', value: { offset: 0 } },
  //   update: {},
  // })
  // const cursor = cursorRow.value as { offset: number }
  // const offset = cursor.offset ?? 0

  // // ── 2. Load active coins for this batch
  // // const mappedCoinIds = Object.keys(TV_SYMBOL_MAP)
  // const coins = await prisma.coin.findMany({
  //   where: { is_active: true },
  //   orderBy: { market_cap_rank: 'asc' },
  //   skip: offset,
  //   take: BATCH_SIZE,
  // })
  // console.log(`coins batch: ${JSON.stringify(coins.map(item => item.symbol))}`)

  // if (coins.length === 0) {
  //   await prisma.cronState.update({
  //     where: { key: 'refresh_analysis_cursor' },
  //     data: { value: { offset: 0 } },
  //   })
  //   return NextResponse.json({ done: true, message: 'Full cycle complete, cursor reset.' })
  // }

  // // ── 3. Fetch fresh market prices in one batch call ──
  // const marketMap = await fetchMarketBatch(coins.map(c => c.coin_id))

  // // ── 4. Fetch latest analysis for each coin (skip-if-unchanged check) ──
  // const latestAnalyses = await prisma.analysis.findMany({
  //   where: { coin_id: { in: coins.map(c => c.coin_id) } },
  //   orderBy: { generated_at: 'desc' },
  //   distinct: ['coin_id'],
  //   select: { coin_id: true, signal: true, signal_prev: true, trend_prev: true },
  // })
  // const latestMap = new Map(latestAnalyses.map(a => [a.coin_id, a]))

  // const results: Record<string, string> = {}

  // for (let i = 0; i < coins.length; i++) {
  //   const coin = coins[i]
  //   if (i > 0) await sleep(COINGECKO_DELAY_MS)

  //   try {
  //     const mkt = marketMap.get(coin.coin_id)
  //     const currentPrice = mkt?.current_price ?? 0
  //     if (!currentPrice || currentPrice <= 0) {
  //       results[coin.coin_id] = 'SKIP: no price data'
  //       console.warn(`${coin.symbol}: no price data`)
  //       continue
  //     }
      
  //     const ohlcv = await fetchOhlcv(coin.coin_id)
  //     if (!ohlcv) {
  //       results[coin.coin_id] = 'SKIP: no ohlcv'
  //       console.warn(`${coin.symbol}: no price ohlcv`)
  //       continue
  //     }

  //     // Pass live currentPrice so detectSR classifies levels against the same
  //     // reference price that validateAnalysis will check — OHLC lastClose can
  //     // be 2–4 days stale on CoinGecko's 365-day endpoint (4-day candles).
  //     const ta = computeTechnicalAnalysis(ohlcv, currentPrice)
  //     const latest = latestMap.get(coin.coin_id)

  //     // ── 5. Deterministic market score (Layer 1) ──
  //     const marketScore = computeMarketScore(ta, currentPrice)

  //     // ── 6. Pre-compute both trade setups (deterministic, no AI) ──
  //     const longSetup  = calculateTradeSetup(ta.srLevels, 'LONG', currentPrice, ta.atr_value)
  //     const shortSetup = calculateTradeSetup(ta.srLevels, 'SHORT', currentPrice, ta.atr_value)
  //     const validatedSetups: TradeSetupResult[] = [longSetup, shortSetup]

  //     // ── 6b. Validate S/R and setup math before persisting ──
  //     const validation = validateAnalysis(currentPrice, ta.srLevels, validatedSetups)
  //     if (!validation.valid) {
  //       results[coin.coin_id] = `SKIP: validation — ${validation.errors.join('; ')}`
  //       console.warn(`${results[coin.coin_id]}::: ${coin.symbol}: validation - ${validation.errors.join('; ')}`)
  //       continue
  //     }

  //     // ── 7. AI interpretation (Layer 2) — confidence + grades + narrative only ──
  //     // Skip AI call when signal is unchanged (score-based, not trend-based).
  //     const signalUnchanged = latest?.signal === marketScore.signal
  //     let interpretation: AIInterpretation
  //     let aiUsed = true

  //     if (signalUnchanged && latest) {
  //       const prev = await prisma.analysis.findFirst({
  //         where: { coin_id: coin.coin_id },
  //         orderBy: { generated_at: 'desc' },
  //         select: { confidence_pct: true, claude_call: true },
  //       })
  //       if (prev) {
  //         aiUsed = false
  //         const confFloor = Math.min(75, marketScore.confidence_ceiling)
  //         const conf = Math.min(Math.max(prev.confidence_pct, confFloor), marketScore.confidence_ceiling)
  //         interpretation = {
  //           confidence_pct: conf,
  //           setup_grades: {
  //             LONG:  validatedSetups.find(s => s.direction === 'LONG')
  //               ? (marketScore.signal === 'BUY'  ? (conf >= 75 ? 'A' : 'B') : 'C') : null,
  //             SHORT: validatedSetups.find(s => s.direction === 'SHORT')
  //               ? (marketScore.signal === 'SELL' ? (conf >= 75 ? 'A' : 'B') : 'C') : null,
  //           },
  //           claude_call: prev.claude_call,
  //         }
  //       } else {
  //         interpretation = await callAI(coin.name, currentPrice, ta, validatedSetups, marketScore, ai)
  //       }
  //     } else {
  //       interpretation = await callAI(coin.name, currentPrice, ta, validatedSetups, marketScore, ai)
  //     }

  //     const now = new Date()
  //     const expiresAt = new Date(now.getTime() + ANALYSIS_TTL_HOURS * 60 * 60 * 1000)

  //     // ── 8. Persist analysis + related records ──
  //     await prisma.$transaction(async (tx) => {
  //       const analysis = await tx.analysis.create({
  //         data: {
  //           coin_id:          coin.coin_id,
  //           current_price:    currentPrice,
  //           price_change_24h: mkt?.price_change_percentage_24h ?? 0,
  //           signal:           marketScore.signal,       // deterministic
  //           confidence_pct:   interpretation.confidence_pct,
  //           weekly_bias:      marketScore.weekly_bias,  // deterministic
  //           claude_call:      interpretation.claude_call,
  //           signal_prev:      latest?.signal ?? null,
  //           trend_prev:       ta.trend,
  //           generated_at:     now,
  //           expires_at:       expiresAt,
  //         },
  //       })

  //       if (analysis) console.log(`success create analysis: ${coin.symbol}`)

  //       // S/R levels — skip zero-price fallback placeholders
  //       const srToSave = ta.srLevels.filter(lv => lv.price > 0)
  //       if (srToSave.length > 0) {
  //         await tx.supportResistance.createMany({
  //           data: srToSave.map(lv => ({
  //             analysis_id:     analysis.id,
  //             level_type:      lv.level_type,
  //             strength:        lv.strength,
  //             price:           lv.price,
  //             confluence_note: lv.confluence_note,
  //             sort_order:      lv.sort_order,
  //           })),
  //         })
  //       }

  //       // Indicators
  //       await tx.indicator.create({
  //         data: {
  //           analysis_id:     analysis.id,
  //           rsi_value:       ta.rsi,
  //           rsi_status:      ta.rsi_status,
  //           macd_line:       ta.macd_line,
  //           macd_signal:     ta.macd_signal_line,
  //           macd_histogram:  ta.macd_histogram,
  //           macd_cross:      ta.macd_cross,
  //           ema20:           ta.ema20,
  //           ema200:          ta.ema200,
  //           price_vs_ema20:  ta.price_vs_ema20,
  //           price_vs_ema200: ta.price_vs_ema200,
  //           bb_upper:        ta.bb_upper,
  //           bb_middle:       ta.bb_middle,
  //           bb_lower:        ta.bb_lower,
  //           bb_status:       ta.bb_status,
  //           atr_value:       ta.atr_value,
  //           volume_status:   ta.volume_status,
  //         },
  //       })

  //       // Trade setups — grade and conviction from AI interpretation
  //       if (validatedSetups.length > 0) {
  //         await tx.tradeSetup.createMany({
  //           data: validatedSetups.map((setup: TradeSetupResult) => {
  //             const alignedSignal = setup.direction === 'LONG' ? 'BUY' : 'SELL'
  //             const isCounterTrend = marketScore.signal !== 'NEUTRAL' && marketScore.signal !== alignedSignal
  //             // Counter-trend setups are capped at grade C regardless of AI grade
  //             const aiGrade = interpretation.setup_grades[setup.direction] ?? 'C'
  //             const grade = isCounterTrend ? 'C' : aiGrade
  //             const conviction: 'HIGH' | 'MEDIUM' | 'LOW' =
  //               grade === 'A' ? 'HIGH' : grade === 'B' ? 'MEDIUM' : 'LOW'
  //             const setupNote = isCounterTrend
  //               ? `Counter-trend ${setup.direction.toLowerCase()}. Reduce size, confirm reversal first.`
  //               : null
  //             return {
  //               analysis_id:     analysis.id,
  //               direction:       setup.direction,
  //               grade,
  //               conviction,
  //               entry_zone_low:  setup.entry_zone_low,
  //               entry_zone_high: setup.entry_zone_high,
  //               stop_tight:      setup.stop_tight,
  //               stop_safe:       setup.stop_safe,
  //               risk_pct_tight:  setup.risk_pct_tight,
  //               risk_pct_safe:   setup.risk_pct_safe,
  //               tp1_price:       setup.tp1_price,
  //               tp1_rr:          setup.tp1_rr,
  //               tp2_price:       setup.tp2_price,
  //               tp2_rr:          setup.tp2_rr,
  //               tp3_price:       setup.tp3_price,
  //               tp3_rr:          setup.tp3_rr,
  //               trigger_note:    setup.trigger_note,
  //               invalidation:    setup.invalidation,
  //               setup_note:      setupNote,
  //             }
  //           }),
  //         })
  //       }

  //       // Update coin price metadata
  //       await tx.coin.update({
  //         where: { coin_id: coin.coin_id },
  //         data: {
  //           market_cap_rank: mkt?.market_cap_rank ?? coin.market_cap_rank,
  //           marketcap_usd:   mkt?.market_cap     ?? coin.marketcap_usd,
  //         },
  //       })
  //     })

  //     const setupCount = validatedSetups.length
  //     results[coin.coin_id] = `OK ${marketScore.signal}(score=${marketScore.score}) conf=${interpretation.confidence_pct}/100 AI=${aiUsed} setups=${setupCount}`
  //     console.log(results[coin.coin_id])
  //   } catch (err) {
  //     results[coin.coin_id] = `ERR: ${String(err).slice(0, 80)}`
  //     console.error(results[coin.coin_id])
  //   }
  // }

  // // ── 9. Advance cursor ──
  // const nextOffset = offset + coins.length
  // await prisma.cronState.update({
  //   where: { key: 'refresh_analysis_cursor' },
  //   data: { value: { offset: nextOffset } },
  // })

  // return NextResponse.json({
  //   processed: coins.length,
  //   offset_before: offset,
  //   offset_after:  nextOffset,
  //   results,
  // })
}
