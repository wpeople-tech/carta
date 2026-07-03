import { useState, useEffect, useRef } from 'react'

// TradingView page title formats observed:
//   "BTCUSDT · 104,820.00 — TradingView"       (en locale, thousands separator)
//   "104,820.00 BTCUSDT — TradingView"
//   "BINANCE:BTCUSDT, 104820.00"
//   "XRPUSDT · 0,728 — TradingView"             (ID/EU locale, comma as decimal)
// Strategy: find ALL numeric tokens, disambiguate comma-as-thousands vs comma-as-decimal,
// then pick the largest candidate in a realistic price range.

// Disambiguates a single numeric token that may use comma as thousands OR decimal separator.
function normalizeToken(token: string): number {
  // Token contains a dot → comma must be thousands separator (e.g. 104,820.00)
  if (token.includes('.')) return parseFloat(token.replace(/,/g, ''))

  const commaIdx = token.indexOf(',')
  if (commaIdx === -1) return parseFloat(token)

  const beforeComma = token.slice(0, commaIdx)
  const afterComma = token.slice(commaIdx + 1)

  // Comma is a decimal separator when: leading digit is 0 (0,728) OR
  // fractional part is not exactly 3 digits (1,28 — not a valid thousands group)
  if (beforeComma === '0' || afterComma.length !== 3) {
    return parseFloat(beforeComma + '.' + afterComma)
  }

  // Ambiguous (1,234) — assume thousands separator, same as en-US
  return parseFloat(token.replace(/,/g, ''))
}

function parsePriceFromTitle(basePrice: number | null): number | null {
  const title = document.title
  console.log('[CARTA] document.title:', title)

  // Extract every number-like token: digits with optional commas and one decimal
  const matches = title.match(/\d+(?:[.,]\d+)*/g) ?? []

  const tokens = matches
    .map(normalizeToken)
    .filter(n => isFinite(n) && n > 0)

  console.log('[CARTA] parsed tokens:', tokens)

  if (tokens.length === 0) return null

  // Pick the token most likely to be a crypto price:
  // prefer values < 10_000_000, pick the largest such value
  const candidates = tokens.filter(n => n < 10_000_000)

  if (candidates.length === 0) return null

  if (basePrice == null) {
    return candidates[0]
  }

  return candidates.reduce((closest, current) => {
    return Math.abs(current - basePrice) < Math.abs(closest - basePrice)
      ? current
      : closest
  })
}

export type PriceDirection = 'up' | 'down' | 'flat'

export interface LivePrice {
  price: number
  direction: PriceDirection
  changeFromBase: number   // absolute
  changePct: number        // percent from DB price
}

export function useLivePrice(basePrice: number | null): LivePrice | null {
  const [live, setLive] = useState<LivePrice | null>(null)
  const prevRef = useRef<number | null>(null)

  useEffect(() => {
    function tick() {
      const price = parsePriceFromTitle(basePrice)
      if (price == null) return

      const prev = prevRef.current
      const direction: PriceDirection =
        prev == null ? 'flat' : price > prev ? 'up' : price < prev ? 'down' : 'flat'
      prevRef.current = price

      const changeFromBase = basePrice != null ? price - basePrice : 0
      const changePct = basePrice != null && basePrice > 0
        ? (changeFromBase / basePrice) * 100
        : 0

      setLive({ price, direction, changeFromBase, changePct })
    }

    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [basePrice])

  return live
}
