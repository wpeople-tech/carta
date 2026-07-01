'use client'

import { useState } from 'react'
import { motion } from 'motion/react'
import { fadeUp, fadeIn, easeOut, easeOutFast, staggerContainer, viewportOnce } from '@/design.config'

const C = {
  bg: '#F5F4F0',
  surface: '#EDECEA',
  surface2: '#E4E2DE',
  border: '#D0CEC9',
  ink: '#0F0F0D',
  inkMuted: '#6B6860',
  inkFaint: '#7d7c79',
  green: '#1A7A4A',
  greenDim: 'rgba(26,122,74,0.094)',
  red: '#C0392B',
  redDim: 'rgba(192,57,43,0.094)',
}

const MONO = "'JetBrains Mono', monospace"
const SANS = "'Space Grotesk', sans-serif"
const BODY = "'Inter', sans-serif"

export interface CoinRow {
  coin_id: string
  symbol: string
  name: string
  image_url: string | null
  market_cap_rank: number | null
  signal: 'BUY' | 'SELL' | 'NEUTRAL' | null
  confidence_pct: number | null
  current_price: number | null
  price_change_24h: number | null
}

function formatPrice(p: number): string {
  if (p >= 1000) return `$${p.toLocaleString('en-US', { maximumFractionDigits: 0 })}`
  if (p >= 1) return `$${p.toFixed(2)}`
  if (p >= 0.01) return `$${p.toFixed(4)}`
  return `$${p.toFixed(6)}`
}

export default function CoverageSection({ coins }: { coins: CoinRow[] }) {
  const [coinFilter, setCoinFilter] = useState<'ALL' | 'BUY' | 'SELL' | 'NEUTRAL'>('ALL')
  const [coinSearch, setCoinSearch] = useState('')

  const buyCount = coins.filter(c => c.signal === 'BUY').length
  const sellCount = coins.filter(c => c.signal === 'SELL').length
  const neutralCount = coins.filter(c => c.signal === 'NEUTRAL').length

  const filteredCoins = coins
    .filter(c => coinFilter === 'ALL' || c.signal === coinFilter)
    .filter(c =>
      coinSearch === '' ||
      c.name.toLowerCase().includes(coinSearch.toLowerCase()) ||
      c.symbol.toLowerCase().includes(coinSearch.toLowerCase())
    )

  return (
    <section
      id="coverage"
      style={{ maxWidth: 1280, margin: '0 auto', padding: '100px 48px', position: 'relative', zIndex: 1 }}
    >
      <motion.div
        variants={fadeUp}
        initial="hidden"
        whileInView="visible"
        viewport={viewportOnce}
        transition={easeOut}
      >
        <div style={{ fontFamily: MONO, fontSize: 14, fontWeight: 500, letterSpacing: '0.12em', color: C.inkFaint, textTransform: 'uppercase', marginBottom: 16 }}>Coverage</div>
        <h2 style={{ fontFamily: SANS, fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: 700, lineHeight: 1.1, letterSpacing: '-0.02em' }}>
          {coins.length}+ coins.<br />All pre-analyzed.
        </h2>
      </motion.div>

      {/* Signal filter bar */}
      <motion.div
        variants={fadeUp}
        initial="hidden"
        whileInView="visible"
        viewport={viewportOnce}
        transition={{ ...easeOut, delay: 0.1 }}
        style={{ display: 'flex', gap: 12, marginTop: 40, flexWrap: 'wrap', alignItems: 'center' }}
      >
        {([
          { label: 'ALL' as const, count: coins.length, color: C.ink, dim: C.surface2 },
          { label: 'BUY' as const, count: buyCount, color: C.green, dim: C.greenDim },
          { label: 'SELL' as const, count: sellCount, color: C.red, dim: C.redDim },
          { label: 'NEUTRAL' as const, count: neutralCount, color: C.inkMuted, dim: C.surface2 },
        ]).map(({ label, count, color, dim }) => (
          <label
            key={label}
            style={{
              fontFamily: MONO, fontSize: 13, fontWeight: 600, letterSpacing: '0.06em',
              padding: '8px 18px', border: `1px solid ${color}`,
              background: coinFilter === label ? color : dim,
              color: coinFilter === label ? '#fff' : color,
              cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8,
              transition: 'all 0.15s',
            }}
          >
            <input
              type="radio"
              name="coin-filter"
              value={label}
              checked={coinFilter === label}
              onChange={() => setCoinFilter(label)}
              style={{ accentColor: color, width: 14, height: 14, cursor: 'pointer' }}
            />
            <span style={{ fontFamily: MONO, fontSize: 18, fontWeight: 700 }}>{count}</span>
            {label}
          </label>
        ))}
        <div style={{ marginLeft: 'auto' }}>
          <input
            type="text"
            placeholder="Search coin…"
            value={coinSearch}
            onChange={e => setCoinSearch(e.target.value)}
            style={{
              fontFamily: MONO, fontSize: 13, padding: '8px 14px',
              border: `1px solid ${C.border}`, background: C.surface,
              color: C.ink, outline: 'none', width: 180,
              letterSpacing: '0.04em',
            }}
          />
        </div>
      </motion.div>

      {/* Coin grid — no animation dependency on data, always renders */}
      <div style={{ marginTop: 24 }}>
        {filteredCoins.length === 0 ? (
          <div style={{ padding: '48px 0', textAlign: 'center', fontFamily: MONO, fontSize: 14, color: C.inkFaint, letterSpacing: '0.06em' }}>
            No coins match your filter.
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 1, background: C.border, border: `1px solid ${C.border}` }}>
            {filteredCoins.map((coin) => {
              const sig = coin.signal
              const sigColor = sig === 'BUY' ? C.green : sig === 'SELL' ? C.red : C.inkMuted
              const sigDim = sig === 'BUY' ? C.greenDim : sig === 'SELL' ? C.redDim : C.surface2
              const change = coin.price_change_24h
              const changeColor = change == null ? C.inkFaint : change >= 0 ? C.green : C.red

              return (
                <motion.div
                  key={coin.coin_id}
                  whileHover={{ y: -2, boxShadow: '0 6px 20px rgba(0,0,0,0.08)', zIndex: 2 }}
                  transition={easeOutFast}
                  style={{ background: C.bg, padding: '16px 18px', position: 'relative' }}
                >
                  {coin.market_cap_rank && (
                    <span style={{ position: 'absolute', top: 10, right: 12, fontFamily: MONO, fontSize: 10, color: C.inkFaint, letterSpacing: '0.06em' }}>
                      #{coin.market_cap_rank}
                    </span>
                  )}

                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                    {coin.image_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={coin.image_url} alt={coin.symbol} width={24} height={24} style={{ borderRadius: '50%', flexShrink: 0 }} />
                    ) : (
                      <div style={{ width: 24, height: 24, borderRadius: '50%', background: C.surface2, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <span style={{ fontFamily: MONO, fontSize: 8, fontWeight: 700, color: C.inkFaint }}>{coin.symbol.slice(0, 2).toUpperCase()}</span>
                      </div>
                    )}
                    <div>
                      <div style={{ fontFamily: MONO, fontSize: 13, fontWeight: 600, color: C.ink, letterSpacing: '0.04em' }}>{coin.symbol.toUpperCase()}</div>
                      <div style={{ fontFamily: BODY, fontSize: 11, color: C.inkFaint, lineHeight: 1.2 }}>{coin.name}</div>
                    </div>
                  </div>

                  {coin.current_price != null && (
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginBottom: 8 }}>
                      <span style={{ fontFamily: MONO, fontSize: 13, fontWeight: 500, color: C.ink, fontVariantNumeric: 'tabular-nums' }}>
                        {formatPrice(coin.current_price)}
                      </span>
                      {change != null && (
                        <span style={{ fontFamily: MONO, fontSize: 11, color: changeColor }}>
                          {change >= 0 ? '+' : ''}{change.toFixed(2)}%
                        </span>
                      )}
                    </div>
                  )}

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    {sig ? (
                      <span style={{
                        fontFamily: MONO, fontSize: 10, fontWeight: 700, letterSpacing: '0.08em',
                        padding: '3px 8px', background: sigDim, color: sigColor, border: `1px solid ${sigColor}`,
                      }}>
                        {sig === 'BUY' ? '▲ ' : sig === 'SELL' ? '▼ ' : '— '}{sig}
                      </span>
                    ) : (
                      <span style={{ fontFamily: MONO, fontSize: 10, color: C.inkFaint, letterSpacing: '0.06em' }}>PENDING</span>
                    )}
                    {coin.confidence_pct != null && (
                      <span style={{ fontFamily: MONO, fontSize: 11, color: C.inkFaint }}>{coin.confidence_pct}%</span>
                    )}
                  </div>
                </motion.div>
              )
            })}
          </div>
        )}
      </div>

      <p style={{ marginTop: 16, fontFamily: MONO, fontSize: 12, color: C.inkFaint, letterSpacing: '0.06em', textAlign: 'right' }}>
        {filteredCoins.length} of {coins.length} coins · Refreshed every 4h
      </p>
    </section>
  )
}
