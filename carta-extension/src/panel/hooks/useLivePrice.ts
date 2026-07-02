import { useState, useEffect, useRef } from 'react'

// TradingView page title formats observed:
//   "BTCUSDT · 104,820.00 — TradingView"
//   "104,820.00 BTCUSDT — TradingView"
//   "BINANCE:BTCUSDT, 104820.00"
// Strategy: find ALL numeric tokens (with optional commas/dots),
// pick the one most likely to be a price (largest value that looks like price range).
function parsePriceFromTitle(): number | null {
  const title = document.title
  console.log('[CARTA] document.title:', title)

  // Extract every number-like token: digits with optional commas and one decimal
  const tokens = [...title.matchAll(/([\d]{1,3}(?:,[\d]{3})*(?:\.[\d]+)?|[\d]+\.[\d]+|[\d]{4,})/g)]
    .map(m => parseFloat(m[1].replace(/,/g, '')))
    .filter(n => isFinite(n) && n > 0)

  console.log('[CARTA] parsed tokens:', tokens)

  if (tokens.length === 0) return null

  // Pick the token most likely to be a crypto price:
  // prefer values > 0.0001 and < 10_000_000, pick the largest such value
  const candidates = tokens.filter(n => n > 0.0001 && n < 10_000_000)
  if (candidates.length === 0) return null

  return Math.max(...candidates)
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
      const price = parsePriceFromTitle()
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
