import type { OhlcvData } from './coingecko'

export interface TechnicalAnalysis {
  signal: 'BUY' | 'SELL' | 'NEUTRAL'
  confidence_pct: number
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
  support: number[]
  resistance: number[]
}

function calcRsi(close: number[], period = 14): number {
  const deltas = close.slice(1).map((v, i) => v - close[i])
  const gains = deltas.map(d => Math.max(d, 0))
  const losses = deltas.map(d => Math.abs(Math.min(d, 0)))
  const avgG = gains.slice(0, period).reduce((a, b) => a + b, 0) / period
  const avgL = losses.slice(0, period).reduce((a, b) => a + b, 0) / period
  const rs = avgL === 0 ? 100 : avgG / avgL
  return Math.round((100 - 100 / (1 + rs)) * 100) / 100
}

function calcEma(data: number[], period: number): number[] {
  const k = 2 / (period + 1)
  const ema = [data[0]]
  for (let i = 1; i < data.length; i++) {
    ema.push(data[i] * k + ema[i - 1] * (1 - k))
  }
  return ema
}

function calcMacd(close: number[]) {
  const ema12 = calcEma(close, 12)
  const ema26 = calcEma(close, 26)
  const macdLine = ema12.map((v, i) => v - ema26[i])
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

  // bandwidth thresholds: squeeze <5%, expansion >15%
  const bb_status: 'SQUEEZE' | 'EXPANSION' | 'NORMAL' =
    bandwidth < 0.05 ? 'SQUEEZE' : bandwidth > 0.15 ? 'EXPANSION' : 'NORMAL'

  return { bb_upper: upper, bb_middle: middle, bb_lower: lower, bb_status }
}

function calcAtr(close: number[], period = 14): number {
  const trs: number[] = []
  for (let i = 1; i < close.length; i++) {
    trs.push(Math.abs(close[i] - close[i - 1]))
  }
  return trs.slice(-period).reduce((a, b) => a + b, 0) / period
}

function detectSR(highs: number[], lows: number[], n = 10): { support: number[]; resistance: number[] } {
  const support: number[] = []
  const resistance: number[] = []

  for (let i = n; i < lows.length - n; i++) {
    const windowLow = lows.slice(i - n, i + n)
    if (lows[i] === Math.min(...windowLow)) support.push(Math.round(lows[i] * 1e8) / 1e8)
    const windowHigh = highs.slice(i - n, i + n)
    if (highs[i] === Math.max(...windowHigh)) resistance.push(Math.round(highs[i] * 1e8) / 1e8)
  }

  function dedup(levels: number[]): number[] {
    const sorted = [...levels].sort((a, b) => a - b)
    const result: number[] = []
    for (const lv of sorted) {
      if (lv <= 0) continue
      if (!result.length || (lv - result[result.length - 1]) / result[result.length - 1] > 0.02) {
        result.push(lv)
      }
    }
    return result
  }

  const s = dedup(support)
  const r = dedup(resistance)
  return {
    support: s.length > 3 ? s.slice(-3) : s,
    resistance: r.length > 3 ? r.slice(0, 3) : r,
  }
}

export function computeTechnicalAnalysis(ohlcv: OhlcvData): TechnicalAnalysis {
  const { close, high, low } = ohlcv

  const rsi = calcRsi(close)
  const ema20Arr = calcEma(close, 20)
  const ema200Arr = calcEma(close, 200)
  const ema20 = ema20Arr[ema20Arr.length - 1]
  const ema200 = ema200Arr[ema200Arr.length - 1]
  const lastClose = close[close.length - 1]

  const goldenCross = ema20 > ema200
  const diffPct = (ema20 - ema200) / ema200 * 100
  const trend = diffPct > 1.5 ? 'Bullish' : diffPct < -1.5 ? 'Bearish' : 'Sideways'

  const macd = calcMacd(close)
  const bb = calcBollinger(close)
  const atr_value = calcAtr(close)
  const { support, resistance } = detectSR(high, low)

  // Scoring
  let score = 50
  if (rsi < 65 && goldenCross) score += 20
  if (rsi < 30) score += 10
  if (rsi > 70) score -= 15
  if (!goldenCross) score -= 15
  if (macd.macd_cross === 'BULLISH') score += 5
  if (macd.macd_cross === 'BEARISH') score -= 5
  score = Math.max(10, Math.min(95, score))

  const signal: 'BUY' | 'SELL' | 'NEUTRAL' =
    score >= 60 ? 'BUY' : score <= 40 ? 'SELL' : 'NEUTRAL'

  const rsi_status: 'OVERBOUGHT' | 'OVERSOLD' | 'NEUTRAL' =
    rsi > 70 ? 'OVERBOUGHT' : rsi < 30 ? 'OVERSOLD' : 'NEUTRAL'

  return {
    signal,
    confidence_pct: score,
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
    volume_status: 'NORMAL',  // CoinGecko free tier tidak expose volume per-hari, default NORMAL
    support,
    resistance,
  }
}

export function buildNarasiPrompt(
  coinName: string,
  ta: TechnicalAnalysis,
  currentPrice: number,
): string {
  return (
    `You are a concise crypto market analyst. Write exactly 2 sentences analyzing ${coinName} ` +
    `(current price: $${currentPrice.toLocaleString()}). ` +
    `Data: RSI=${ta.rsi} (${ta.rsi_status}), trend=${ta.trend}, signal=${ta.signal}, ` +
    `EMA20=${ta.ema20.toFixed(4)}, EMA200=${ta.ema200.toFixed(4)}, ` +
    `MACD=${ta.macd_cross}, BB=${ta.bb_status}, ` +
    `key support=${ta.support.join('/')}, key resistance=${ta.resistance.join('/')}. ` +
    `Mention the most important S&R levels and the primary signal driver. Plain English, no jargon.`
  )
}
