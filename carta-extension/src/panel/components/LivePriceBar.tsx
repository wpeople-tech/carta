import { useState, useEffect, useRef } from 'react'
import type { LivePrice } from '../hooks/useLivePrice'
import { formatPrice } from '../utils'

interface Props {
  live: LivePrice
  symbol: string
}

export default function LivePriceBar({ live, symbol }: Props) {
  const [flash, setFlash] = useState<'up' | 'down' | null>(null)
  const prevPrice = useRef<number>(live.price)

  useEffect(() => {
    if (live.price === prevPrice.current) return
    const dir = live.price > prevPrice.current ? 'up' : 'down'
    prevPrice.current = live.price
    setFlash(dir)
    const t = setTimeout(() => setFlash(null), 600)
    return () => clearTimeout(t)
  }, [live.price])

  const ticker = symbol.includes(':') ? symbol.split(':')[1] : symbol

  return (
    <div
      className={`carta-live-bar${flash ? ` carta-live-bar--${flash}` : ''}`}
    >
      <div className="carta-live-left">
        <span className="carta-live-ticker">{ticker}</span>
        <span className="carta-live-dot" />
        <span className="carta-live-label">LIVE</span>
      </div>
      <div className="carta-live-right">
        <span
          className={`carta-live-price${flash ? ` carta-live-price--${flash}` : ''}`}
        >
          ${formatPrice(live.price)}
        </span>
      </div>
    </div>
  )
}
