'use client'

import { useState, useEffect } from 'react'
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
}

const MONO = "'JetBrains Mono', monospace"
const BODY = "'Inter', sans-serif"

export default function HeroPanel({ defaultMinimized = false }: { defaultMinimized?: boolean }) {
  const [srValues, setSrValues] = useState(['', '', '', ''])
  const [confidence, setConfidence] = useState(0)
  const [minimized, setMinimized] = useState(defaultMinimized)

  useEffect(() => {
    const t = setTimeout(() => {
      const targets = ['$109,400', '$105,800', '$101,400', '$97,200']
      targets.forEach((val, idx) => {
        let j = 0
        const iv = setInterval(() => {
          setSrValues(prev => {
            const n = [...prev]
            n[idx] = val.slice(0, j + 1)
            return n
          })
          j++
          if (j >= val.length) clearInterval(iv)
        }, 30)
      })
      let c = 0
      const ct = setInterval(() => {
        c += 3
        if (c >= 82) { setConfidence(82); clearInterval(ct) } else setConfidence(c)
      }, 20)
    }, 600)
    return () => clearTimeout(t)
  }, [])

  return (
    <motion.div
      initial={{ opacity: 0, y: 32 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: 'easeOut', delay: 0.4 }}
      style={{ width: '100%' }}
    >
      <div className="overflow-hidden bg-background border border-border-base shadow-xl font-technical text-[12px]">
        {/* Panel header — always visible */}
        <div
          className="flex items-center justify-between"
          style={{ background: C.ink, color: C.bg, padding: '10px 16px' }}
        >
          <div className="flex items-center" style={{ gap: 8, fontSize: 14, fontWeight: 600, letterSpacing: '0.08em' }}>
            <span className="panel-dot-pulse inline-block rounded-full" style={{ width: 6, height: 6, background: C.signal }} />
            CARTA
          </div>
          <div className="flex items-center" style={{ gap: 12 }}>
            <span style={{ fontSize: 14, color: '#999', letterSpacing: '0.04em' }}>BTCUSDT · Daily</span>
            {/* Minimize / maximize button */}
            <button
              onClick={() => setMinimized(v => !v)}
              title={minimized ? 'Expand panel' : 'Minimize panel'}
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                color: '#999', padding: '2px 4px', display: 'flex', alignItems: 'center',
                transition: 'color 0.15s',
              }}
              onMouseEnter={e => (e.currentTarget.style.color = '#fff')}
              onMouseLeave={e => (e.currentTarget.style.color = '#999')}
            >
              {minimized ? (
                /* expand icon — two arrows pointing out */
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M2 9v3h3M12 5V2H9M2 5V2h3M12 9v3H9" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              ) : (
                /* minimize icon — two arrows pointing in */
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
              {/* Signal bar */}
              <div className="flex items-center justify-between" style={{ padding: '14px 16px', borderBottom: `1px solid ${C.border}` }}>
                <span
                  className="inline-flex items-center"
                  style={{ gap: 6, fontSize: 13, fontWeight: 600, letterSpacing: '0.06em', padding: '6px 14px', background: C.greenDim, color: C.green, border: `1px solid ${C.green}` }}
                >
                  ▲ BUY
                </span>
                <div className="text-right" style={{ fontSize: 14, color: C.inkMuted }}>
                  <strong className="block" style={{ fontSize: 18, fontWeight: 600, color: C.green }}>{confidence}%</strong>
                  Confidence
                </div>
              </div>

              {/* S/R Levels */}
              <div style={{ padding: '12px 16px', borderBottom: `1px solid ${C.border}` }}>
                <div className="uppercase" style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.1em', color: C.inkFaint, marginBottom: 10 }}>
                  Support & Resistance · Daily
                </div>
                {([{ dot: C.red, label: 'Strong Resistance', val: srValues[0] }, { dot: '#e07070', label: 'Weak Resistance', val: srValues[1] }] as { dot: string; label: string; val: string }[]).map(({ dot, label, val }) => (
                  <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '4px 0', borderBottom: `1px solid ${C.border}` }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 14, color: C.inkMuted }}>
                      <span style={{ width: 5, height: 5, borderRadius: '50%', background: dot, flexShrink: 0, display: 'inline-block' }} />
                      {label}
                    </div>
                    <span style={{ fontSize: 12, fontWeight: 500, color: C.ink, fontVariantNumeric: 'tabular-nums' }}>{val}</span>
                  </div>
                ))}
                <div className="flex justify-between items-center" style={{ background: C.signalDim, margin: '0 -16px', padding: '4px 16px' }}>
                  <span style={{ color: C.signal, fontSize: 10, letterSpacing: '0.06em' }}>CURRENT · $103,240</span>
                  <span style={{ color: C.signal, fontSize: 10 }}>+1.8% from support</span>
                </div>
                {([{ dot: '#70b090', label: 'Weak Support', val: srValues[2] }, { dot: C.green, label: 'Strong Support', val: srValues[3] }] as { dot: string; label: string; val: string }[]).map(({ dot, label, val }) => (
                  <div key={label} className="flex justify-between items-center border-b" style={{ padding: '4px 0', borderColor: C.border }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 14, color: C.inkMuted }}>
                      <span style={{ width: 5, height: 5, borderRadius: '50%', background: dot, flexShrink: 0, display: 'inline-block' }} />
                      {label}
                    </div>
                    <span style={{ fontSize: 12, fontWeight: 500, color: C.ink, fontVariantNumeric: 'tabular-nums' }}>{val}</span>
                  </div>
                ))}
              </div>

              {/* Indicators */}
              <div style={{ padding: '12px 16px', borderBottom: `1px solid ${C.border}` }}>
                <div className="uppercase" style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.1em', color: C.inkFaint, marginBottom: 10 }}>Indicators</div>
                <div className="grid grid-cols-2" style={{ gap: 8 }}>
                  {([
                    { label: 'RSI (14)', value: '58.4 · Neutral', color: C.green },
                    { label: 'MACD', value: 'Bullish Cross', color: C.green },
                    { label: 'EMA 200', value: 'Above', color: C.green },
                    { label: 'Volume', value: 'Above Avg', color: C.inkMuted },
                  ] as { label: string; value: string; color: string }[]).map(({ label, value, color }) => (
                    <div key={label} style={{ background: C.surface, padding: '8px 10px' }}>
                      <div style={{ fontSize: 10, color: C.inkFaint, letterSpacing: '0.06em', marginBottom: 3 }}>{label}</div>
                      <div style={{ fontSize: 13, fontWeight: 500, color }}>{value}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Trade Setup */}
              <div style={{ padding: '12px 16px', borderBottom: `1px solid ${C.border}` }}>
                <div className="uppercase" style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.1em', color: C.inkFaint, marginBottom: 10 }}>
                  Trade Setup · Long (A-Grade)
                </div>
                {([
                  { label: 'Entry Zone', value: '$101,200 – $102,000', color: C.ink },
                  { label: 'Stop (tight)', value: '$99,800 · −1.4%', color: C.red },
                  { label: 'TP1', value: '$105,800 · +3.8R', color: C.green },
                  { label: 'TP2', value: '$109,400 · +7.4R', color: C.green },
                  { label: 'Invalidation', value: '4H close below $99,800', color: C.red },
                ] as { label: string; value: string; color: string }[]).map(({ label, value, color }) => (
                  <div key={label} className="flex justify-between items-center" style={{ padding: '5px 0', fontSize: 14 }}>
                    <span style={{ color: C.inkFaint }}>{label}</span>
                    <span className="font-medium" style={{ color, fontVariantNumeric: 'tabular-nums' }}>{value}</span>
                  </div>
                ))}
              </div>

              {/* CARTA's Call */}
              <div className="italic" style={{ padding: '12px 16px', background: C.surface, borderTop: `2px solid ${C.signal}`, fontSize: 14, lineHeight: 1.6, color: C.inkMuted, fontFamily: BODY }}>
                <strong className="block uppercase" style={{ color: C.signal, fontFamily: MONO, fontSize: 10, letterSpacing: '0.08em', marginBottom: 4 }}>
                  CARTA&apos;s Call
                </strong>
                Price is holding above the weekly structure with clean volume. I&apos;d wait for a 4H close inside
                the entry zone before committing. If it flushes to $97,200, that&apos;s the deeper setup. Higher conviction there.
              </div>

              {/* Freshness row */}
              <div className="flex justify-between" style={{ padding: '8px 16px', fontSize: 10, color: C.inkFaint, letterSpacing: '0.04em' }}>
                <span>mcptrade.site · Full analysis →</span>
                <span>Generated 1h ago</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}
