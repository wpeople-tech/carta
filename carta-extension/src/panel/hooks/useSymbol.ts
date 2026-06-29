import { useState, useEffect } from 'react'

function detectSymbol(): string | null {
  const params = new URLSearchParams(window.location.search)
  const raw = params.get('symbol')
  if (raw) {
    // Pertahankan full format "EXCHANGE:SYMBOL" agar cocok dengan tradingview_sym di DB
    const upper = raw.toUpperCase()
    const pair = upper.includes(':') ? upper.split(':')[1] : upper
    if (pair.endsWith('USDT')) return upper
  }

  // DOM fallback — TradingView kadang tidak taruh symbol di URL
  const el = document.querySelector<HTMLElement>('[data-symbol-short]')
  if (el) {
    const sym = (el.getAttribute('data-symbol-short') ?? '').toUpperCase()
    if (sym.endsWith('USDT')) return sym
  }

  return null
}

export function useSymbol(): string | null {
  const [symbol, setSymbol] = useState<string | null>(detectSymbol)

  useEffect(() => {
    let lastUrl = window.location.href

    const interval = setInterval(() => {
      const currentUrl = window.location.href
      if (currentUrl !== lastUrl) {
        lastUrl = currentUrl
        setSymbol(detectSymbol())
      }
    }, 800)

    return () => clearInterval(interval)
  }, [])

  return symbol
}
