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

const PAGE_SIZE = 20

export default function CoverageSection({ coins }: { coins: CoinRow[] }) {
  const [coinFilter, setCoinFilter] = useState<'ALL' | 'BUY' | 'SELL' | 'NEUTRAL'>('ALL')
  const [coinSearch, setCoinSearch] = useState('')
  const [page, setPage] = useState(1)

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

  const totalPages = Math.max(1, Math.ceil(filteredCoins.length / PAGE_SIZE))
  const safePage = Math.min(page, totalPages)
  const pagedCoins = filteredCoins.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE)

  function goTo(p: number) {
    setPage(Math.max(1, Math.min(p, totalPages)))
  }

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
              onChange={() => { setCoinFilter(label); setPage(1) }}
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
            onChange={e => { setCoinSearch(e.target.value); setPage(1) }}
            style={{
              fontFamily: MONO, fontSize: 13, padding: '8px 14px',
              border: `1px solid ${C.border}`, background: C.surface,
              color: C.ink, outline: 'none', width: 180,
              letterSpacing: '0.04em',
            }}
          />
        </div>
      </motion.div>

      {/* Coin table */}
      <div style={{ marginTop: 24, border: `1px solid ${C.border}`, overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: C.surface, borderBottom: `1px solid ${C.border}` }}>
              {['#', 'Coin', 'Price', '24h', 'Signal', 'Conf.'].map((h, i) => (
                <th
                  key={h}
                  style={{
                    fontFamily: MONO, fontSize: 11, fontWeight: 600, letterSpacing: '0.08em',
                    color: C.inkFaint, textTransform: 'uppercase',
                    padding: '10px 16px', textAlign: i === 0 ? 'center' : i >= 3 ? 'right' : 'left',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredCoins.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ padding: '48px 0', textAlign: 'center', fontFamily: MONO, fontSize: 14, color: C.inkFaint, letterSpacing: '0.06em' }}>
                  No coins match your filter.
                </td>
              </tr>
            ) : (
              pagedCoins.map((coin, idx) => {
                const sig = coin.signal
                const sigColor = sig === 'BUY' ? C.green : sig === 'SELL' ? C.red : C.inkMuted
                const sigDim = sig === 'BUY' ? C.greenDim : sig === 'SELL' ? C.redDim : C.surface2
                const change = coin.price_change_24h
                const changeColor = change == null ? C.inkFaint : change >= 0 ? C.green : C.red

                return (
                  <motion.tr
                    key={coin.coin_id}
                    whileHover={{ backgroundColor: C.surface }}
                    transition={easeOutFast}
                    style={{
                      borderBottom: `1px solid ${C.border}`,
                      background: C.bg,
                    }}
                  >
                    {/* Rank */}
                    <td style={{ fontFamily: MONO, fontSize: 11, color: C.inkFaint, padding: '12px 16px', textAlign: 'center', minWidth: 48 }}>
                      {coin.market_cap_rank ?? '—'}
                    </td>

                    {/* Coin */}
                    <td style={{ padding: '12px 16px', minWidth: 180 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        {coin.image_url ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={coin.image_url} alt={coin.symbol} width={22} height={22} style={{ borderRadius: '50%', flexShrink: 0 }} />
                        ) : (
                          <div style={{ width: 22, height: 22, borderRadius: '50%', background: C.surface2, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <span style={{ fontFamily: MONO, fontSize: 7, fontWeight: 700, color: C.inkFaint }}>{coin.symbol.slice(0, 2).toUpperCase()}</span>
                          </div>
                        )}
                        <div>
                          <div style={{ fontFamily: MONO, fontSize: 13, fontWeight: 600, color: C.ink, letterSpacing: '0.04em' }}>{coin.symbol.toUpperCase()}</div>
                          <div style={{ fontFamily: BODY, fontSize: 11, color: C.inkFaint }}>{coin.name}</div>
                        </div>
                      </div>
                    </td>

                    {/* Price */}
                    <td style={{ fontFamily: MONO, fontSize: 13, fontWeight: 500, color: C.ink, padding: '12px 16px', fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap' }}>
                      {coin.current_price != null ? formatPrice(coin.current_price) : '—'}
                    </td>

                    {/* 24h change */}
                    <td style={{ fontFamily: MONO, fontSize: 12, color: changeColor, padding: '12px 16px', textAlign: 'right', fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap' }}>
                      {change != null ? `${change >= 0 ? '+' : ''}${change.toFixed(2)}%` : '—'}
                    </td>

                    {/* Signal */}
                    <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                      {sig ? (
                        <span style={{
                          fontFamily: MONO, fontSize: 10, fontWeight: 700, letterSpacing: '0.08em',
                          padding: '3px 8px', background: sigDim, color: sigColor, border: `1px solid ${sigColor}`,
                          whiteSpace: 'nowrap',
                        }}>
                          {sig === 'BUY' ? '▲ ' : sig === 'SELL' ? '▼ ' : '— '}{sig}
                        </span>
                      ) : (
                        <span style={{ fontFamily: MONO, fontSize: 10, color: C.inkFaint, letterSpacing: '0.06em' }}>PENDING</span>
                      )}
                    </td>

                    {/* Confidence */}
                    <td style={{ fontFamily: MONO, fontSize: 12, color: C.inkFaint, padding: '12px 16px', textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>
                      {coin.confidence_pct != null ? `${coin.confidence_pct}%` : '—'}
                    </td>
                  </motion.tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div style={{ marginTop: 16, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <span style={{ fontFamily: MONO, fontSize: 12, color: C.inkFaint, letterSpacing: '0.06em' }}>
          {filteredCoins.length} of {coins.length} coins · Refreshed every 4h
        </span>

        {totalPages > 1 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            {/* Prev */}
            <button
              onClick={() => goTo(safePage - 1)}
              disabled={safePage === 1}
              style={{
                fontFamily: MONO, fontSize: 12, padding: '5px 10px',
                border: `1px solid ${C.border}`, background: C.surface,
                color: safePage === 1 ? C.inkFaint : C.ink,
                cursor: safePage === 1 ? 'default' : 'pointer',
                opacity: safePage === 1 ? 0.4 : 1,
              }}
            >
              ‹
            </button>

            {/* Page numbers */}
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter(p => p === 1 || p === totalPages || Math.abs(p - safePage) <= 1)
              .reduce<(number | '…')[]>((acc, p, i, arr) => {
                if (i > 0 && p - (arr[i - 1] as number) > 1) acc.push('…')
                acc.push(p)
                return acc
              }, [])
              .map((p, i) =>
                p === '…' ? (
                  <span key={`ellipsis-${i}`} style={{ fontFamily: MONO, fontSize: 12, color: C.inkFaint, padding: '5px 6px' }}>…</span>
                ) : (
                  <button
                    key={p}
                    onClick={() => goTo(p as number)}
                    style={{
                      fontFamily: MONO, fontSize: 12, padding: '5px 10px',
                      border: `1px solid ${p === safePage ? C.ink : C.border}`,
                      background: p === safePage ? C.ink : C.surface,
                      color: p === safePage ? '#fff' : C.ink,
                      cursor: 'pointer', minWidth: 32,
                    }}
                  >
                    {p}
                  </button>
                )
              )}

            {/* Next */}
            <button
              onClick={() => goTo(safePage + 1)}
              disabled={safePage === totalPages}
              style={{
                fontFamily: MONO, fontSize: 12, padding: '5px 10px',
                border: `1px solid ${C.border}`, background: C.surface,
                color: safePage === totalPages ? C.inkFaint : C.ink,
                cursor: safePage === totalPages ? 'default' : 'pointer',
                opacity: safePage === totalPages ? 0.4 : 1,
              }}
            >
              ›
            </button>
          </div>
        )}
      </div>
    </section>
  )
}
