'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'motion/react'

const C = {
  bg: '#F5F4F0',
  surface: '#EDECEA',
  border: '#D0CEC9',
  ink: '#0F0F0D',
  inkMuted: '#6B6860',
  inkFaint: '#7d7c79',
  signal: '#FF6B00',
  signalDim: 'rgba(255,107,0,0.094)',
  green: '#1A7A4A',
  greenDim: 'rgba(26,122,74,0.094)',
  red: '#C0392B',
  redDim: 'rgba(192,57,43,0.094)',
}

const MONO = "'JetBrains Mono', monospace"
const BODY = "'Inter', sans-serif"

function fmt(p: number | null | undefined): string {
  if (p == null) return '--'
  if (p >= 1000) return `$${p.toLocaleString('en-US', { maximumFractionDigits: 0 })}`
  if (p >= 1) return `$${p.toFixed(2)}`
  if (p >= 0.01) return `$${p.toFixed(4)}`
  return `$${p.toFixed(6)}`
}

export interface HeroPanelSRLevel {
  level_type: 'SUPPORT' | 'RESISTANCE'
  strength: 'STRONG' | 'WEAK'
  price: number
}

export interface HeroPanelIndicators {
  rsi_value: number
  rsi_status: 'OVERBOUGHT' | 'OVERSOLD' | 'NEUTRAL'
  macd_cross: 'BULLISH' | 'BEARISH' | 'NONE'
  price_vs_ema200: 'ABOVE' | 'BELOW'
  price_vs_ema20: 'ABOVE' | 'BELOW'
  volume_status: 'ABOVE_AVG' | 'BELOW_AVG' | 'NORMAL'
  bb_status: 'SQUEEZE' | 'EXPANSION' | 'NORMAL'
}

export interface HeroPanelTradeSetup {
  direction: 'LONG' | 'SHORT'
  grade: 'A' | 'B' | 'C'
  entry_zone_low: number | null
  entry_zone_high: number | null
  stop_tight: number | null
  risk_pct_tight: number | null
  tp1_price: number | null
  tp1_rr: number | null
  tp2_price: number | null
  tp2_rr: number | null
  invalidation: string | null
}

export interface HeroPanelData {
  symbol: string
  signal: 'BUY' | 'SELL' | 'NEUTRAL'
  confidence_pct: number
  weekly_bias: 'BULLISH' | 'BEARISH' | 'NEUTRAL'
  claude_call: string
  current_price: number
  generated_at: string
  support_resistance: HeroPanelSRLevel[]
  indicator: HeroPanelIndicators | null
  trade_setups: HeroPanelTradeSetup[]
}

interface Props {
  defaultMinimized?: boolean
  data?: HeroPanelData | null
}

type PriceDir = 'up' | 'down' | 'flat'

export default function HeroPanel({ defaultMinimized = false, data }: Props) {
  const [minimized, setMinimized] = useState(defaultMinimized)
  const [livePrice, setLivePrice] = useState<number | null>(data?.current_price ?? null)
  const [priceDir, setPriceDir] = useState<PriceDir>('flat')
  const [flash, setFlash] = useState(false)
  const prevPriceRef = useRef<number | null>(data?.current_price ?? null)

  // Poll /api/btc-price every 15s for live price
  useEffect(() => {
    let cancelled = false

    async function tick() {
      try {
        const res = await fetch('/api/btc-price')
        if (!res.ok || cancelled) return
        const json = await res.json() as { price: number | null }
        if (json.price == null || cancelled) return

        const prev = prevPriceRef.current
        if (prev !== null && json.price !== prev) {
          const dir: PriceDir = json.price > prev ? 'up' : 'down'
          setPriceDir(dir)
          setFlash(true)
          setTimeout(() => setFlash(false), 600)
        }
        prevPriceRef.current = json.price
        setLivePrice(json.price)
      } catch { /* ignore */ }
    }

    tick()
    const id = setInterval(tick, 15_000)
    return () => { cancelled = true; clearInterval(id) }
  }, [])

  // Derived display values
  const signal = data?.signal ?? 'NEUTRAL'
  const confidence = data?.confidence_pct ?? 0
  const indicator = data?.indicator ?? null

  const sigColor = signal === 'BUY' ? C.green : signal === 'SELL' ? C.red : C.inkMuted
  const sigDim = signal === 'BUY' ? C.greenDim : signal === 'SELL' ? C.redDim : C.surface
  const sigLabel = signal === 'BUY' ? '▲ BUY' : signal === 'SELL' ? '▼ SELL' : '● NEUTRAL'

  const resistances = (data?.support_resistance ?? [])
    .filter(l => l.level_type === 'RESISTANCE')
    .sort((a, b) => b.price - a.price)
  const supports = (data?.support_resistance ?? [])
    .filter(l => l.level_type === 'SUPPORT')
    .sort((a, b) => b.price - a.price)

  const dotColor = (l: HeroPanelSRLevel) =>
    l.level_type === 'RESISTANCE'
      ? (l.strength === 'STRONG' ? C.red : '#e07070')
      : (l.strength === 'STRONG' ? C.green : '#70b090')

  const nearestRes = resistances[resistances.length - 1]
  const nearestSup = supports[0]
  const distToRes = livePrice && nearestRes
    ? ((nearestRes.price - livePrice) / livePrice) * 100
    : null
  const distToSup = livePrice && nearestSup
    ? ((livePrice - nearestSup.price) / nearestSup.price) * 100
    : null

  const longSetup = data?.trade_setups.find(s => s.direction === 'LONG') ?? null

  const livePriceColor = priceDir === 'up' ? C.green : priceDir === 'down' ? C.red : C.ink
  const liveBg = flash
    ? (priceDir === 'up' ? 'rgba(26,122,74,0.08)' : 'rgba(192,57,43,0.08)')
    : C.surface

  const biasColor = data?.weekly_bias === 'BULLISH' ? C.green : data?.weekly_bias === 'BEARISH' ? C.red : C.inkMuted

  function cap(s: string) { return s.charAt(0) + s.slice(1).toLowerCase() }

  const indItems = indicator ? [
    { label: 'RSI (14)', value: `${indicator.rsi_value.toFixed(1)} · ${cap(indicator.rsi_status)}`, color: indicator.rsi_status === 'OVERBOUGHT' ? C.red : indicator.rsi_status === 'OVERSOLD' ? C.green : C.inkMuted },
    { label: 'MACD', value: indicator.macd_cross === 'BULLISH' ? 'Bullish Cross' : indicator.macd_cross === 'BEARISH' ? 'Bearish Cross' : 'No Cross', color: indicator.macd_cross === 'BULLISH' ? C.green : indicator.macd_cross === 'BEARISH' ? C.red : C.inkMuted },
    { label: 'EMA 200', value: cap(indicator.price_vs_ema200), color: indicator.price_vs_ema200 === 'ABOVE' ? C.green : C.red },
    { label: 'Volume', value: indicator.volume_status === 'ABOVE_AVG' ? 'Above Avg' : indicator.volume_status === 'BELOW_AVG' ? 'Below Avg' : 'Normal', color: indicator.volume_status === 'ABOVE_AVG' ? C.green : C.inkMuted },
  ] : [
    { label: 'RSI (14)', value: '--', color: C.inkMuted },
    { label: 'MACD', value: '--', color: C.inkMuted },
    { label: 'EMA 200', value: '--', color: C.inkMuted },
    { label: 'Volume', value: '--', color: C.inkMuted },
  ]

  const timeAgo = (iso: string) => {
    const h = Math.round((Date.now() - new Date(iso).getTime()) / 3_600_000)
    return h < 1 ? 'just now' : `${h}h ago`
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 32 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: 'easeOut', delay: 0.4 }}
      style={{ width: '100%' }}
    >
      <div style={{ overflow: 'hidden', background: C.bg, border: `1px solid ${C.border}`, boxShadow: '0 8px 32px rgba(0,0,0,0.14)', fontFamily: MONO, fontSize: 12 }}>

        {/* Header */}
        <div style={{ background: C.ink, color: C.bg, padding: '10px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, fontWeight: 600, letterSpacing: '0.08em' }}>
            <span className="panel-dot-pulse" style={{ display: 'inline-block', width: 6, height: 6, borderRadius: '50%', background: C.signal }} />
            CARTA
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ fontSize: 14, color: '#999', letterSpacing: '0.04em' }}>
              {data?.symbol ?? 'BTCUSDT'} · Daily
            </span>
            <button
              onClick={() => setMinimized(v => !v)}
              title={minimized ? 'Expand panel' : 'Minimize panel'}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#999', padding: '2px 4px', display: 'flex', alignItems: 'center', transition: 'color 0.15s' }}
              onMouseEnter={e => (e.currentTarget.style.color = '#fff')}
              onMouseLeave={e => (e.currentTarget.style.color = '#999')}
            >
              {minimized ? (
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M2 9v3h3M12 5V2H9M2 5V2h3M12 9v3H9" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              ) : (
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M5 2v3H2M9 2v3h3M5 12V9H2M9 12V9h3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Collapsible body */}
        <AnimatePresence initial={false}>
          {!minimized && (
            <motion.div
              key="panel-body"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: [0.22, 0.97, 0.36, 1] }}
              style={{ overflow: 'hidden' }}
            >
              {/* Signal + Confidence */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', borderBottom: `1px solid ${C.border}` }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 600, letterSpacing: '0.06em', padding: '6px 14px', background: sigDim, color: sigColor, border: `1px solid ${sigColor}` }}>
                  {sigLabel}
                </span>
                <div style={{ textAlign: 'right', fontSize: 14, color: C.inkMuted }}>
                  <strong style={{ display: 'block', fontSize: 18, fontWeight: 600, color: sigColor }}>{confidence}%</strong>
                  Confidence
                </div>
              </div>

              {/* Live price bar */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 16px', borderBottom: `1px solid ${C.border}`, background: liveBg, transition: 'background 0.3s ease' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: C.ink, letterSpacing: '0.06em' }}>
                    {data?.symbol ?? 'BTCUSDT'}
                  </span>
                  <span className="panel-dot-pulse" style={{ display: 'inline-block', width: 5, height: 5, borderRadius: '50%', background: C.signal }} />
                  <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', color: C.signal }}>LIVE</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                  <span style={{ fontSize: 16, fontWeight: 800, color: livePriceColor, fontVariantNumeric: 'tabular-nums', transition: 'color 0.25s ease' }}>
                    {livePrice != null ? fmt(livePrice) : '--'}
                  </span>
                  {data?.weekly_bias && (
                    <span style={{ fontSize: 11, color: biasColor, fontWeight: 600 }}>
                      {data.weekly_bias}
                    </span>
                  )}
                </div>
              </div>

              {/* S/R Levels */}
              <div style={{ padding: '12px 16px', borderBottom: `1px solid ${C.border}` }}>
                <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.1em', color: C.inkFaint, textTransform: 'uppercase', marginBottom: 10 }}>
                  Support &amp; Resistance · Daily
                </div>

                {resistances.map(l => (
                  <div key={`r-${l.price}`} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '4px 0', borderBottom: `1px solid ${C.border}` }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 14, color: C.inkMuted }}>
                      <span style={{ width: 5, height: 5, borderRadius: '50%', background: dotColor(l), flexShrink: 0, display: 'inline-block' }} />
                      {l.strength === 'STRONG' ? 'Strong Resistance' : 'Weak Resistance'}
                    </div>
                    <span style={{ fontSize: 12, fontWeight: 500, color: C.ink, fontVariantNumeric: 'tabular-nums' }}>{fmt(l.price)}</span>
                  </div>
                ))}

                {/* Current price row */}
                {livePrice != null && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: C.signalDim, margin: '0 -16px', padding: '5px 16px' }}>
                    <span style={{ color: C.signal, fontSize: 10, fontWeight: 700, letterSpacing: '0.06em' }}>
                      ▶ CURRENT{distToRes != null ? ` · ${distToRes.toFixed(1)}% to res` : ''}
                    </span>
                    <span style={{ color: C.signal, fontSize: 12, fontWeight: 800, fontVariantNumeric: 'tabular-nums' }}>{fmt(livePrice)}</span>
                  </div>
                )}

                {supports.map(l => (
                  <div key={`s-${l.price}`} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '4px 0', borderBottom: `1px solid ${C.border}` }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 14, color: C.inkMuted }}>
                      <span style={{ width: 5, height: 5, borderRadius: '50%', background: dotColor(l), flexShrink: 0, display: 'inline-block' }} />
                      {l.strength === 'STRONG' ? 'Strong Support' : 'Weak Support'}
                    </div>
                    <span style={{ fontSize: 12, fontWeight: 500, color: C.ink, fontVariantNumeric: 'tabular-nums' }}>{fmt(l.price)}</span>
                  </div>
                ))}

                {distToSup != null && (
                  <div style={{ paddingTop: 4, fontSize: 10, color: C.inkFaint, textAlign: 'right' }}>
                    {distToSup.toFixed(1)}% above nearest support
                  </div>
                )}
              </div>

              {/* Indicators */}
              <div style={{ padding: '12px 16px', borderBottom: `1px solid ${C.border}` }}>
                <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.1em', color: C.inkFaint, textTransform: 'uppercase', marginBottom: 10 }}>Indicators</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                  {indItems.map(({ label, value, color }) => (
                    <div key={label} style={{ background: C.surface, padding: '8px 10px' }}>
                      <div style={{ fontSize: 10, color: C.inkFaint, letterSpacing: '0.06em', marginBottom: 3 }}>{label}</div>
                      <div style={{ fontSize: 13, fontWeight: 500, color }}>{value}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Trade Setup */}
              {longSetup && (
                <div style={{ padding: '12px 16px', borderBottom: `1px solid ${C.border}` }}>
                  <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.1em', color: C.inkFaint, textTransform: 'uppercase', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 8 }}>
                    Trade Setup · Long
                    <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 6px', border: `1.5px solid`, background: longSetup.grade === 'A' ? C.greenDim : longSetup.grade === 'B' ? '#fff3e0' : C.surface, color: longSetup.grade === 'A' ? C.green : longSetup.grade === 'B' ? '#E65100' : C.inkMuted, borderColor: longSetup.grade === 'A' ? C.green : longSetup.grade === 'B' ? '#E65100' : C.border }}>
                      {longSetup.grade}
                    </span>
                  </div>
                  {[
                    { label: 'Entry Zone', value: longSetup.entry_zone_low && longSetup.entry_zone_high ? `${fmt(longSetup.entry_zone_low)} – ${fmt(longSetup.entry_zone_high)}` : '--', color: C.ink },
                    { label: 'Stop (tight)', value: longSetup.stop_tight ? `${fmt(longSetup.stop_tight)} · −${longSetup.risk_pct_tight?.toFixed(1)}%` : '--', color: C.red },
                    { label: 'TP1', value: longSetup.tp1_price ? `${fmt(longSetup.tp1_price)} · +${longSetup.tp1_rr?.toFixed(1)}R` : '--', color: C.green },
                    { label: 'TP2', value: longSetup.tp2_price ? `${fmt(longSetup.tp2_price)} · +${longSetup.tp2_rr?.toFixed(1)}R` : '--', color: C.green },
                    { label: 'Invalidation', value: longSetup.invalidation ?? '--', color: C.red },
                  ].map(({ label, value, color }) => (
                    <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', padding: '5px 0', fontSize: 14 }}>
                      <span style={{ color: C.inkFaint, flexShrink: 0, marginRight: 8 }}>{label}</span>
                      <span style={{ color, fontWeight: 500, fontVariantNumeric: 'tabular-nums', textAlign: 'right' }}>{value}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* CARTA's Call */}
              {data?.claude_call && (
                <div style={{ padding: '12px 16px', background: C.surface, borderTop: `2px solid ${C.signal}`, fontFamily: BODY }}>
                  <strong style={{ display: 'block', textTransform: 'uppercase', color: C.signal, fontFamily: MONO, fontSize: 10, letterSpacing: '0.08em', marginBottom: 4 }}>
                    CARTA&apos;s Call
                  </strong>
                  <p style={{ fontSize: 14, lineHeight: 1.6, color: C.inkMuted, fontStyle: 'italic', margin: 0 }}>
                    {data.claude_call}
                  </p>
                </div>
              )}

              {/* Footer */}
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 16px', fontSize: 10, color: C.inkFaint, letterSpacing: '0.04em' }}>
                <span>{data?.generated_at ? `Generated ${timeAgo(data.generated_at)}` : 'Live preview'}</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}
