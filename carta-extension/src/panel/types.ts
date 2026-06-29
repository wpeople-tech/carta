export type Signal = 'BUY' | 'SELL' | 'NEUTRAL'
export type WeeklyBias = 'BULLISH' | 'BEARISH' | 'NEUTRAL'
export type LevelType = 'SUPPORT' | 'RESISTANCE'
export type Strength = 'STRONG' | 'WEAK'
export type Direction = 'LONG' | 'SHORT'
export type Grade = 'A' | 'B' | 'C'

export interface SRLevel {
  level_type: LevelType
  strength: Strength
  price: number
  confluence_note: string | null
  sort_order: number
}

export interface Indicators {
  rsi_value: number
  rsi_status: 'OVERBOUGHT' | 'OVERSOLD' | 'NEUTRAL'
  macd_cross: 'BULLISH' | 'BEARISH' | 'NONE'
  price_vs_ema20: 'ABOVE' | 'BELOW'
  price_vs_ema200: 'ABOVE' | 'BELOW'
  bb_status: 'SQUEEZE' | 'EXPANSION' | 'NORMAL'
  atr_value: number
  volume_status: 'ABOVE_AVG' | 'BELOW_AVG' | 'NORMAL'
}

export interface TradeSetup {
  direction: Direction
  grade: Grade
  conviction: 'HIGH' | 'MEDIUM' | 'LOW'
  entry_zone_low: number
  entry_zone_high: number
  stop_tight: number
  stop_safe: number
  risk_pct_tight: number
  risk_pct_safe: number
  tp1_price: number
  tp1_rr: number
  tp2_price: number
  tp2_rr: number
  tp3_price: number | null
  tp3_rr: number | null
  trigger_note: string
  invalidation: string
  setup_note: string | null
}

export interface Analysis {
  id: string
  symbol: string
  tradingview_sym: string
  name: string
  generated_at: string
  expires_at: string
  signal: Signal
  confidence_pct: number
  weekly_bias: WeeklyBias
  claude_call: string
  support_resistance: SRLevel[]
  indicators: Indicators[]
  trade_setups: TradeSetup[]
}
