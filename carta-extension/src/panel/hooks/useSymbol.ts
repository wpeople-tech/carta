import { useState, useEffect } from 'react'

function parseSymbolFromTitle(): string | null {
  // Formats observed:
  //   "BTCUSDT · 104,820.00 — TradingView"
  //   "104,820.00 BTCUSDT — TradingView"
  //   "BINANCE:BTCUSDT, 104820.00"
  // Extract all uppercase ticker-like tokens and find the one ending with USDT
  const tokens = document.title.match(/\b[A-Z][A-Z0-9]*USDT\b/g) ?? []
  return tokens[0] ?? null
}

function detectSymbol(): string | null {
  // 1. Title — paling up-to-date, selalu berubah saat user switch symbol
  const fromTitle = parseSymbolFromTitle()
  if (fromTitle) return fromTitle

  // 2. DOM attribute
  const el = document.querySelector<HTMLElement>('[data-symbol-short]')
  if (el) {
    const sym = (el.getAttribute('data-symbol-short') ?? '').toUpperCase()
    const pair = sym.includes(':') ? sym.split(':')[1] : sym
    if (pair.endsWith('USDT')) return pair
  }

  // 3. URL param — fallback saat title belum siap (initial load)
  const params = new URLSearchParams(window.location.search)
  const raw = params.get('symbol')
  if (raw) {
    const upper = raw.toUpperCase()
    const pair = upper.includes(':') ? upper.split(':')[1] : upper
    if (pair.endsWith('USDT')) return pair
  }

  return null
}

export function useSymbol(): string | null {
  const [symbol, setSymbol] = useState<string | null>(detectSymbol)

  useEffect(() => {
    // MutationObserver on <title> — fires immediately when TradingView updates the title
    const titleEl = document.querySelector('title')
    const observer = titleEl
      ? new MutationObserver(() => {
          setSymbol(detectSymbol())
        })
      : null
    observer?.observe(titleEl!, { childList: true })

    // Safety fallback polling in case observer doesn't fire
    const interval = setInterval(() => {
      setSymbol(prev => {
        const next = detectSymbol()
        return next !== prev ? next : prev
      })
    }, 1500)

    return () => {
      observer?.disconnect()
      clearInterval(interval)
    }
  }, [])

  return symbol
}
