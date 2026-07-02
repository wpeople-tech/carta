import type { OhlcvData } from './coingecko'

export interface SRLevel {
  level_type: 'SUPPORT' | 'RESISTANCE'
  strength: 'STRONG' | 'WEAK'
  price: number
  touches: number
  confluence_note: string | null
  sort_order: number
}

export interface TradeSetupResult {
  direction: 'LONG' | 'SHORT'
  entry_zone_low: number | null
  entry_zone_high: number | null
  stop_tight: number | null
  stop_safe: number | null
  risk_pct_tight: number | null
  risk_pct_safe: number | null
  tp1_price: number | null
  tp1_rr: number | null
  tp2_price: number | null
  tp2_rr: number | null
  tp3_price: number | null
  tp3_rr: number | null
  trigger_note: string | null
  invalidation: string | null
}

export interface TechnicalAnalysis {
  trend: string
  rsi: number
  ema20: number
  ema200: number
  macd_line: number
  macd_signal_line: number
  macd_histogram: number
  macd_cross: 'BULLISH' | 'BEARISH' | 'NONE'
  price_vs_ema20: 'ABOVE' | 'BELOW'
  price_vs_ema200: 'ABOVE' | 'BELOW'
  rsi_status: 'OVERBOUGHT' | 'OVERSOLD' | 'NEUTRAL'
  bb_upper: number
  bb_middle: number
  bb_lower: number
  bb_status: 'SQUEEZE' | 'EXPANSION' | 'NORMAL'
  atr_value: number
  volume_status: 'ABOVE_AVG' | 'BELOW_AVG' | 'NORMAL'
  srLevels: SRLevel[]
}

// Deterministik score dari Layer 1 — signal & weekly_bias tidak pernah dari AI
export interface MarketScore {
  score: number
  signal: 'BUY' | 'SELL' | 'NEUTRAL'
  confidence_ceiling: number
  weekly_bias: 'BULLISH' | 'BEARISH' | 'NEUTRAL'
  breakdown: { ema20: number; ema200: number; macd: number; rsi: number; sr: number }
}

// Structured output yang dikembalikan AI — hanya confidence, grades, dan narrative
export interface AIInterpretation {
  confidence_pct: number
  setup_grades: { LONG: 'A' | 'B' | 'C' | null; SHORT: 'A' | 'B' | 'C' | null }
  claude_call: string
}

// ── Indicator helpers ───────────────────────────────────────────

function calcRsi(close: number[], period = 14): number {
  if (close.length < period + 1) {
    throw new Error("Not enough candles")
  }

  const deltas = []

  for (let i = 1; i < close.length; i++) {
    deltas.push(close[i] - close[i - 1])
  }

  let gain = 0
  let loss = 0

  for (let i = 0; i < period; i++) {
    const d = deltas[i]

    if (d >= 0) gain += d
    else loss -= d
  }

  let avgGain = gain / period
  let avgLoss = loss / period

  for (let i = period; i < deltas.length; i++) {
    const d = deltas[i]

    const currentGain = d > 0 ? d : 0
    const currentLoss = d < 0 ? -d : 0

    avgGain = ((avgGain * (period - 1)) + currentGain) / period
    avgLoss = ((avgLoss * (period - 1)) + currentLoss) / period
  }

  if (avgLoss === 0) return 100

  const rs = avgGain / avgLoss
  return Number((100 - 100 / (1 + rs)).toFixed(2))
}

function calcEma(data: number[], period: number): number[] {
  if (data.length < period) return []

  const k = 2 / (period + 1)

  const ema: number[] = []

  const sma = data.slice(0, period).reduce((a, b) => a + b, 0) / period

  ema.push(sma)

  for (let i = period; i < data.length; i++) {
    ema.push(
      data[i] * k +
      ema[ema.length - 1] * (1 - k)
    )
  }

  return ema
}

function calcMacd(close: number[]) {
  const ema12 = calcEma(close, 12)
  const ema26 = calcEma(close, 26)
  // ema12 starts at index 11, ema26 at index 25 — align by trimming ema12's leading values
  const offset = ema12.length - ema26.length
  const macdLine = ema26.map((v, i) => ema12[i + offset] - v)
  const signalLine = calcEma(macdLine.slice(25), 9)
  const lastMacd = macdLine[macdLine.length - 1]
  const lastSignal = signalLine[signalLine.length - 1]
  const prevMacd = macdLine[macdLine.length - 2]
  const prevSignal = signalLine[signalLine.length - 2]
  const cross: 'BULLISH' | 'BEARISH' | 'NONE' =
    prevMacd <= prevSignal && lastMacd > lastSignal ? 'BULLISH' :
      prevMacd >= prevSignal && lastMacd < lastSignal ? 'BEARISH' : 'NONE'
  return { macd_line: lastMacd, macd_signal_line: lastSignal, macd_histogram: lastMacd - lastSignal, macd_cross: cross }
}

function calcBollinger(close: number[], period = 20) {
  const slice = close.slice(-period)
  const middle = slice.reduce((a, b) => a + b, 0) / period
  const variance = slice.reduce((sum, v) => sum + (v - middle) ** 2, 0) / period
  const stdDev = Math.sqrt(variance)
  const upper = middle + 2 * stdDev
  const lower = middle - 2 * stdDev
  const bandwidth = (upper - lower) / middle
  const bb_status: 'SQUEEZE' | 'EXPANSION' | 'NORMAL' =
    bandwidth < 0.05 ? 'SQUEEZE' : bandwidth > 0.15 ? 'EXPANSION' : 'NORMAL'
  return { bb_upper: upper, bb_middle: middle, bb_lower: lower, bb_status }
}

interface Candle {
  high: number
  low: number
  close: number
}

function calcAtr(
  candles: Candle[],
  period = 14
): number {
  if (candles.length < period + 1) {
    throw new Error("Not enough candles")
  }

  const tr: number[] = []

  for (let i = 1; i < candles.length; i++) {
    const current = candles[i]
    const prev = candles[i - 1]

    tr.push(
      Math.max(
        current.high - current.low,
        Math.abs(current.high - prev.close),
        Math.abs(current.low - prev.close)
      )
    )
  }

  let atr =
    tr.slice(0, period).reduce((a, b) => a + b, 0) / period

  for (let i = period; i < tr.length; i++) {
    atr =
      ((atr * (period - 1)) + tr[i]) / period
  }

  return Number(atr.toFixed(4))
}

// ── S/R Detection ───────────────────────────────────────────────
// Deteksi pivot high/low, filter ke radius proximity dari current
// price, dedup level berdekatan, sort sesuai arah, beri strength
// berdasarkan touch count. Assertions menjamin urutan tidak terbalik.

function detectSR(
  highs: number[],
  lows: number[],
  currentPrice: number,
  n = 5,
  maxLevels = 2,
  tolerancePct = 0.01 // 1% clustering tolerance
): SRLevel[] {

  const pivotHighs: number[] = []
  const pivotLows: number[] = []

  // 1. Pivot detection (non-strict)
  for (let i = n; i < highs.length - n; i++) {
    const isHighPivot =
      highs[i] === Math.max(...highs.slice(i - n, i + n + 1))

    const isLowPivot =
      lows[i] === Math.min(...lows.slice(i - n, i + n + 1))

    if (isHighPivot) pivotHighs.push(highs[i])
    if (isLowPivot) pivotLows.push(lows[i])
  }

  // 2. Better clustering (distance-based grouping)
  function cluster(pivots: number[]) {
    const sorted = [...pivots].sort((a, b) => a - b)
    const clusters: { price: number; touches: number }[] = []

    for (const p of sorted) {
      let found = false

      for (const c of clusters) {
        if (Math.abs(p - c.price) / c.price <= tolerancePct) {
          c.price = (c.price * c.touches + p) / (c.touches + 1)
          c.touches++
          found = true
          break
        }
      }

      if (!found) {
        clusters.push({ price: p, touches: 1 })
      }
    }

    return clusters
  }

  const resistance = cluster(
    pivotHighs.filter(p => p > currentPrice && p <= currentPrice * 1.10)
  )

  const support = cluster(
    pivotLows.filter(p => p < currentPrice)
  )

  // 3. Sort by proximity to price
  resistance.sort((a, b) => a.price - b.price)
  support.sort((a, b) => b.price - a.price)

  function classify(clusters: any[]) {
    if (clusters.length === 0) return []
    const maxTouches = Math.max(...clusters.map(c => c.touches))

    return clusters.map(c => ({
      ...c,
      strength: c.touches >= maxTouches && c.touches > 1
        ? 'STRONG'
        : 'WEAK'
    }))
  }

  const result: SRLevel[] = []

  for (const r of classify(resistance.slice(0, 1))) {
    result.push({
      level_type: 'RESISTANCE',
      strength: r.strength,
      price: r.price,
      touches: r.touches,
      confluence_note: r.touches > 2 ? `Touched ${r.touches}x` : null,
      sort_order: 0,
    })
  }

  for (const s of classify(support.slice(0, maxLevels + 1))) {
    result.push({
      level_type: 'SUPPORT',
      strength: s.strength,
      price: s.price,
      touches: s.touches,
      confluence_note: s.touches > 2 ? `Touched ${s.touches}x` : null,
      sort_order: 0,
    })
  }

  // Guarantee at least 1 level on each side — injected as WEAK with confluence_note
  // so downstream code (calculateTradeSetup, validateAnalysis) always has an anchor.
  if (!result.some(l => l.level_type === 'RESISTANCE')) {
    result.unshift({
      level_type: 'RESISTANCE',
      strength: 'WEAK',
      price: Number((currentPrice * 1.05).toFixed(8)),
      touches: 1,
      confluence_note: 'Estimated — no pivot resistance detected',
      sort_order: 0,
    })
  }

  if (!result.some(l => l.level_type === 'SUPPORT')) {
    result.push({
      level_type: 'SUPPORT',
      strength: 'WEAK',
      price: Number((currentPrice * 0.95).toFixed(8)),
      touches: 1,
      confluence_note: 'Estimated — no pivot support detected',
      sort_order: 0,
    })
  }

  return result
}

// ── Trade Setup Calculation ─────────────────────────────────────
// Entry/Stop/TP dihitung murni berdasarkan S/R yang sudah benar.
// LONG: entry di sekitar support terdekat, stop di bawah support, TP ke resistance.
// SHORT: entry di sekitar resistance terdekat, stop di atas resistance, TP ke support.

export function calculateTradeSetup(
  srLevels: SRLevel[],
  direction: 'LONG' | 'SHORT',
  currentPrice = 0,
  atr = 0,
): TradeSetupResult {

  const supports = srLevels
    .filter(l => l.level_type === 'SUPPORT' && l.price > 0)
    .sort((a, b) => b.price - a.price)   // nearest first

  const resistances = srLevels
    .filter(l => l.level_type === 'RESISTANCE' && l.price > 0)
    .sort((a, b) => a.price - b.price)   // nearest first

  const safeAtr = atr > 0 ? atr : currentPrice * 0.01

  // ── Anchor: nearest SR in the direction of the setup ──
  const fallbackAnchor =
    direction === 'LONG' ? currentPrice - safeAtr : currentPrice + safeAtr

  const anchor1 =
    direction === 'LONG'
      ? supports[0]?.price ?? fallbackAnchor
      : resistances[0]?.price ?? fallbackAnchor

  const anchor2 =
    direction === 'LONG' ? supports[1]?.price : resistances[1]?.price

  // ── Entry zone: percentage-based around anchor1 ──
  // LONG:  S1 − 0.3% .. S1 + 0.6%
  // SHORT: R1 − 0.6% .. R1 + 0.3%
  const entryLow  = direction === 'LONG' ? anchor1 * 0.997 : anchor1 * 0.994
  const entryHigh = direction === 'LONG' ? anchor1 * 1.006 : anchor1 * 1.003

  // ── Stop loss: fixed percentage, stop_safe reaches anchor2 if available ──
  // LONG:  stop_tight = S1 − 1.5%, stop_safe = min(S1 − 3%, S2 − 0.3%)
  // SHORT: stop_tight = R1 + 1.5%, stop_safe = max(R1 + 3%, R2 + 0.3%)
  const stopTight =
    direction === 'LONG' ? anchor1 * 0.985 : anchor1 * 1.015

  const stopSafe =
    direction === 'LONG'
      ? anchor2 != null
        ? Math.min(anchor1 * 0.97, anchor2 * 0.997)
        : anchor1 * 0.97
      : anchor2 != null
        ? Math.max(anchor1 * 1.03, anchor2 * 1.003)
        : anchor1 * 1.03

  const entryMid = (entryLow + entryHigh) / 2
  const riskTight = Math.abs(entryMid - stopTight)
  const riskPctTight = (riskTight / entryMid) * 100
  const riskPctSafe = (Math.abs(entryMid - stopSafe) / entryMid) * 100

  // ── TP targets: next SR levels in trade direction ──
  // LONG → R1/R2/R3 | SHORT → S1/S2/S3
  // Only accept SR targets whose R:R is in the valid range (0, 15].
  // Slots still empty after SR are filled with riskTight-based fallback
  // targeting fixed R:R ratios [1.5, 2.5, 4.0] — always valid regardless of ATR.
  const tpTargets: number[] =
    direction === 'LONG'
      ? resistances.map(r => r.price)
      : supports.map(s => s.price)

  const tpData: Array<{ price: number; rr: number }> = []
  for (const tp of tpTargets) {
    if (tpData.length === 3) break
    const reward = Math.abs(tp - entryMid)
    const rr = riskTight > 0 ? reward / riskTight : 0
    if (rr <= 0 || rr > 15) continue
    tpData.push({ price: Number(tp.toFixed(8)), rr: Number(rr.toFixed(2)) })
  }

  // Fill remaining slots with riskTight-proportional fallback prices
  const RR_TARGETS = [1.5, 2.5, 4.0]
  while (tpData.length < 3) {
    const targetRr = RR_TARGETS[tpData.length]
    const tpPrice = direction === 'LONG'
      ? entryMid + targetRr * riskTight
      : entryMid - targetRr * riskTight
    tpData.push({ price: Number(tpPrice.toFixed(8)), rr: targetRr })
  }

  const triggerNote =
    direction === 'LONG'
      ? `Wait rejection above ${entryHigh.toFixed(4)}`
      : `Wait rejection below ${entryLow.toFixed(4)}`

  const invalidation =
    direction === 'LONG'
      ? `Close below ${stopTight.toFixed(4)}`
      : `Close above ${stopTight.toFixed(4)}`

  return {
    direction,
    entry_zone_low:  Number(entryLow.toFixed(8)),
    entry_zone_high: Number(entryHigh.toFixed(8)),
    stop_tight:      Number(stopTight.toFixed(8)),
    stop_safe:       Number(stopSafe.toFixed(8)),
    risk_pct_tight:  Number(riskPctTight.toFixed(2)),
    risk_pct_safe:   Number(riskPctSafe.toFixed(2)),
    tp1_price: tpData[0].price,
    tp1_rr:    tpData[0].rr,
    tp2_price: tpData[1].price,
    tp2_rr:    tpData[1].rr,
    tp3_price: tpData[2].price,
    tp3_rr:    tpData[2].rr,
    trigger_note: triggerNote,
    invalidation,
  }
}

// ── Validation Layer ────────────────────────────────────────────
// Semua data harus lolos sebelum disimpan ke DB.

export function validateAnalysis(
  currentPrice: number,
  srLevels: SRLevel[],
  setups: (TradeSetupResult | null)[],
): { valid: boolean; errors: string[] } {
  const errors: string[] = []

  const resistances = srLevels.filter(l => l.level_type === 'RESISTANCE')
  const supports = srLevels.filter(l => l.level_type === 'SUPPORT')

  for (const r of resistances) {
    if (r.price <= currentPrice)
      errors.push(`Resistance ${r.price} not above current price ${currentPrice}`)
  }
  for (const s of supports) {
    if (s.price >= currentPrice)
      errors.push(`Support ${s.price} not below current price ${currentPrice}`)
  }

  if (resistances.length > 0 && supports.length > 0) {
    const minResistance = Math.min(...resistances.map(r => r.price))
    const maxSupport = Math.max(...supports.map(s => s.price))
    if (maxSupport >= minResistance)
      errors.push(`Support/resistance overlap: support ${maxSupport} >= resistance ${minResistance}`)
  }

  for (const setup of setups) {
    if (!setup) continue
    for (const [key, val] of Object.entries(setup) as [string, unknown][]) {
      if (!key.includes('_price')) continue
      if (val == null) continue
      if ((val as number) <= 0)
        errors.push(`${setup.direction} ${key} is non-positive: ${val}`)
    }
    for (const [key, val] of Object.entries(setup) as [string, unknown][]) {
      if (!key.includes('_rr')) continue
      if (val == null) continue
      const rr = val as number
      if (rr <= 0 || rr > 15)
        errors.push(`${setup.direction} ${key} outside valid range: ${rr}R`)
    }
  }

  return { valid: errors.length === 0, errors }
}

// ── Market Score (Layer 1 — deterministic) ─────────────────────
// Signal dan weekly_bias ditentukan di sini, bukan oleh AI.

export function computeMarketScore(
  ta: TechnicalAnalysis,
  currentPrice: number,
): MarketScore {
  // EMA scoring
  const ema20 =
    (currentPrice - ta.ema20) / ta.ema20 > 0
      ? Math.min(2, (currentPrice - ta.ema20) / ta.ema20 * 50)
      : Math.max(-2, (currentPrice - ta.ema20) / ta.ema20 * 50)

  const ema200 = ta.price_vs_ema200 === 'ABOVE' ? 2 : -2

  // MACD scoring
  const macd = Math.max(-2, Math.min(2, ta.macd_histogram * 100))

  // RSI scoring
  const rsi =
    ta.rsi < 30 ? (30 - ta.rsi) / 10
      : ta.rsi > 70 ? -(ta.rsi - 70) / 10
        : 0

  // S/R position scoring
  let sr = 0
  const supports = ta.srLevels.filter(l => l.level_type === 'SUPPORT' && l.price > 0)
  const resistances = ta.srLevels.filter(l => l.level_type === 'RESISTANCE' && l.price > 0)
  const nearestSupport = supports[0]
  const nearestResistance = resistances[0]
  if (nearestSupport && nearestSupport.strength === 'STRONG' && currentPrice > 0 &&
    (currentPrice - nearestSupport.price) / currentPrice <= 0.03) sr += 1
  if (nearestResistance && nearestResistance.strength === 'STRONG' && currentPrice > 0 &&
    (nearestResistance.price - currentPrice) / currentPrice <= 0.03) sr -= 1

  const score =
    (ema20 * 1.2) +
    (ema200 * 2.0) +
    (macd * 2.5) +
    (rsi * 1.5) +
    (sr * 2)

  const signal: MarketScore['signal'] =
    score >= 2 ? 'BUY' :
      score <= -2 ? 'SELL' : 'NEUTRAL'

  const abs = Math.abs(score)
  const confidence_ceiling =
    abs >= 6 ? 90 :
      abs >= 4 ? 80 :
        abs >= 2 ? 60 : 50

  const weekly_bias: MarketScore['weekly_bias'] =
    ta.price_vs_ema200 === 'ABOVE' && ta.trend !== 'Bearish' ? 'BULLISH' :
      ta.price_vs_ema200 === 'BELOW' && ta.trend !== 'Bullish' ? 'BEARISH' : 'NEUTRAL'

  return {
    score,
    signal,
    confidence_ceiling,
    weekly_bias,
    breakdown: { ema20, ema200, macd, rsi, sr },
  }
}

// ── Main computation ────────────────────────────────────────────

export function computeTechnicalAnalysis(ohlcv: OhlcvData, priceOverride?: number): TechnicalAnalysis {
  const { close, high, low } = ohlcv
  let candles: Candle[] = [];

  close.forEach((item, idx) => {
    candles.push({
      close: item,
      high: high[idx],
      low: low[idx],
    });
  });

  const rsi = calcRsi(close)
  const ema20Arr = calcEma(close, 20)
  const ema200Arr = calcEma(close, 200)
  const ema20 = ema20Arr[ema20Arr.length - 1]
  const ema200 = ema200Arr[ema200Arr.length - 1]
  const lastClose = close[close.length - 1]
  // Use live market price for S/R classification so levels are consistent with
  // the price used in validateAnalysis. OHLC candles can be 2–4 days stale.
  const srPrice = (priceOverride != null && priceOverride > 0) ? priceOverride : lastClose

  const diffPct = (ema20 - ema200) / ema200 * 100
  const trend = diffPct > 1.5 ? 'Bullish' : diffPct < -1.5 ? 'Bearish' : 'Sideways'

  const macd = calcMacd(close)
  const bb = calcBollinger(close)
  const atr_value = calcAtr(candles)
  const srLevels = detectSR(high, low, srPrice)

  const rsi_status: 'OVERBOUGHT' | 'OVERSOLD' | 'NEUTRAL' =
    rsi > 70 ? 'OVERBOUGHT' : rsi < 30 ? 'OVERSOLD' : 'NEUTRAL'

  return {
    trend,
    rsi,
    ema20,
    ema200,
    ...macd,
    price_vs_ema20: lastClose >= ema20 ? 'ABOVE' : 'BELOW',
    price_vs_ema200: lastClose >= ema200 ? 'ABOVE' : 'BELOW',
    rsi_status,
    ...bb,
    atr_value,
    volume_status: 'NORMAL',
    srLevels,
  }
}

// Builds the prompt for AI Layer 2 — AI reads pre-calculated numbers and returns
// only confidence_pct (within ceiling), setup_grades, and claude_call narrative.
// signal and weekly_bias are already determined by computeMarketScore() — not from AI.
export function buildInterpretationPrompt(
  coinName: string,
  currentPrice: number,
  ta: TechnicalAnalysis,
  setups: TradeSetupResult[],
  marketScore: MarketScore,
): string {

  const supports = ta.srLevels
    .filter(l => l.level_type === 'SUPPORT' && l.price > 0)
    .map(l => ({ strength: l.strength, price: l.price, touches: l.touches }))

  const resistances = ta.srLevels
    .filter(l => l.level_type === 'RESISTANCE' && l.price > 0)
    .map(l => ({ strength: l.strength, price: l.price, touches: l.touches }))

  const indicators = {
    rsi: { value: ta.rsi, status: ta.rsi_status },
    macd: { cross: ta.macd_cross, histogram: ta.macd_histogram },
    ema: {
      ema20: ta.ema20,
      ema200: ta.ema200,
      price_vs_ema20: ta.price_vs_ema20,
      price_vs_ema200: ta.price_vs_ema200,
    },
    bollinger: {
      status: ta.bb_status,
      upper: ta.bb_upper,
      middle: ta.bb_middle,
      lower: ta.bb_lower,
    },
    atr: ta.atr_value,
    trend: ta.trend,
  }

  const setupSummary = setups.map(s => ({
    direction: s.direction,
    entry: `${s.entry_zone_low}–${s.entry_zone_high}`,
    stop_tight: s.stop_tight,
    tp1: `${s.tp1_price} (${s.tp1_rr}R)`,
    tp2: `${s.tp2_price} (${s.tp2_rr}R)`,
    tp3: s.tp3_price ? `${s.tp3_price} (${s.tp3_rr}R)` : null,
  }))

  const { breakdown } = marketScore

  const hasConflict =
    Object.values(breakdown).some(v => v > 0) &&
    Object.values(breakdown).some(v => v < 0)

  const conflictInstruction = hasConflict
    ? `
⚠️ DATA WARNING: Conflicting market signals detected in scoring breakdown:
EMA20=${breakdown.ema20},
EMA200=${breakdown.ema200},
MACD=${breakdown.macd},
RSI=${breakdown.rsi},
SR=${breakdown.sr}

You MUST:
- explicitly mention this conflict in claude_call
- avoid strong conviction statements
- reduce confidence if signals disagree
`
    : ''

  return `
You are CARTA, a STRICT RULE-BASED technical analysis explanation engine.

CRITICAL RULES (NON-NEGOTIABLE):
- You are NOT a trader.
- You are NOT allowed to generate trading decisions.
- You MUST NOT override marketScore.signal.
- You MUST NOT invent or modify any numeric values.
- You ONLY explain precomputed results.

---

INPUT DATA (TRUTH SOURCE):

Coin: ${coinName}
Current Price: ${currentPrice}

SIGNAL (DO NOT OVERRIDE): ${marketScore.signal}
Weekly Bias: ${marketScore.weekly_bias}
Market Score: ${marketScore.score}
Max Confidence Allowed: ${marketScore.confidence_ceiling}%${conflictInstruction}

---

INDICATORS:
${JSON.stringify(indicators, null, 2)}

SUPPORTS:
${JSON.stringify(supports, null, 2)}

RESISTANCES:
${JSON.stringify(resistances, null, 2)}

TRADE SETUPS:
${JSON.stringify(setupSummary, null, 2)}

---

HARD VALIDATION RULES (YOU MUST RESPECT THESE):

1. You MUST NOT say BUY if SIGNAL is SELL.
2. You MUST NOT say SELL if SIGNAL is BUY.
3. You MUST NOT introduce new setups not present in TRADE SETUPS.
4. You MUST NOT reinterpret RSI/EMA/BOLLINGER beyond given status fields.
5. If indicators conflict, you MUST explicitly say "conflicting signals exist".
6. If confidence feels high but trend conflicts exist → you MUST lower it.

---

OUTPUT FORMAT (STRICT JSON ONLY):

{
  "confidence_pct": <integer 0-${marketScore.confidence_ceiling}>,
  "setup_grades": {
    "LONG": "A" | "B" | "C" | null,
    "SHORT": "A" | "B" | "C" | null
  },
  "claude_call": "<2-3 sentences only, first person, CARTA voice>"
}

---

GRADE RULES:
- A = aligned with marketScore.signal AND trend
- B = valid setup but mixed confirmation
- C = counter-trend OR weak confluence
- null = no valid setup

---

CONFIDENCE RULES:
- High confidence ONLY if EMA + MACD + Weekly align
- Medium if mixed signals
- Low if counter-trend or conflicting indicators exist

---

CLAUDE CALL RULES:
- MUST mention trend + setup type
- MUST mention conflicts if any exist
- MUST NOT sound like financial advice
- MUST NOT use phrases like "I am initiating BUY/SELL"
- MUST describe scenario, not decision

---

FINAL REMINDER:
If you are uncertain → default to explaining uncertainty, NOT making conviction statements.
`
}