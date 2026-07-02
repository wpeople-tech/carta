import { useState, useEffect } from 'react'
import { useSymbol } from './hooks/useSymbol'
import { useAnalysis } from './hooks/useAnalysis'
import { useLivePrice } from './hooks/useLivePrice'
import Header from './components/Header'
import SignalBar from './components/SignalBar'
import LivePriceBar from './components/LivePriceBar'
import SRLevels from './components/SRLevels'
import Indicators from './components/Indicators'
import TradeSetup from './components/TradeSetup'
import CartaCall from './components/CartaCall'
import Footer from './components/Footer'

// Guard chrome API — tidak tersedia di dev mode
const storage = typeof chrome !== 'undefined' && chrome.storage?.local
  ? chrome.storage.local
  : null

function PanelContent({ symbol }: { symbol: string | null }) {
  const state = useAnalysis(symbol)
  const basePrice = state.status === 'success' ? state.data.current_price ?? null : null
  const live = useLivePrice(basePrice)

  return (
    <>
      {/* Loading */}
      {state.status === 'loading' && (
        <>
          <div className="carta-signal-bar">
            <div className="carta-badge carta-badge--neutral">--</div>
          </div>
          <div className="carta-body">
            <div className="carta-loading">
              <div className="carta-loading-dot" />
              <span className="carta-loading-text">CARTA READING TERRITORY</span>
            </div>
          </div>
        </>
      )}

      {/* Uncharted / error */}
      {(state.status === 'uncharted' || state.status === 'error' || state.status === 'idle') && (
        <div className="carta-body">
          <div className="carta-uncharted">
            <div className="carta-uncharted-label">
              {state.status === 'error' ? 'Unavailable' : 'Uncharted'}
            </div>
            <div className="carta-uncharted-text">
              {state.status === 'error'
                ? 'Analysis temporarily unavailable. Check your connection.'
                : state.status === 'uncharted'
                ? state.reason
                : 'Open a USDT pair on TradingView.'}
            </div>
          </div>
        </div>
      )}

      {/* Data tersedia */}
      {state.status === 'success' && (
        <>
          <SignalBar
            signal={state.data.signal}
            confidence={state.data.confidence_pct}
            weeklyBias={state.data.weekly_bias}
          />
          {live && symbol && (
            <LivePriceBar live={live} symbol={symbol} />
          )}
          <div className="carta-body">
            <SRLevels
              levels={state.data.support_resistance}
              livePrice={live?.price ?? null}
            />
            {state.data.indicators[0] && (
              <Indicators data={state.data.indicators[0]} />
            )}
            {[...state.data.trade_setups].sort((a, b) => {
              const bias = state.data.weekly_bias
              const priority = (dir: string) =>
                bias === 'BULLISH' ? (dir === 'LONG' ? 0 : 1)
                : bias === 'BEARISH' ? (dir === 'SHORT' ? 0 : 1)
                : (dir === 'LONG' ? 0 : 1)
              return priority(a.direction) - priority(b.direction)
            }).map((setup, idx) => (
              <TradeSetup key={setup.direction} setup={setup} defaultExpanded={idx === 0} />
            ))}
            <CartaCall text={state.data.claude_call} />
          </div>
          <Footer
            generatedAt={state.data.generated_at}
            expiresAt={state.data.expires_at}
          />
        </>
      )}
    </>
  )
}

export default function Panel() {
  const [visible, setVisible] = useState(true)
  const symbol = useSymbol()


  // Restore panel visibility dari chrome.storage
  useEffect(() => {
    storage?.get('cartaPanelVisible', (r: Record<string, unknown>) => {
      if (r.cartaPanelVisible === false) setVisible(false)
    })
  }, [])

  const toggle = () => {
    setVisible(v => {
      const next = !v
      storage?.set({ cartaPanelVisible: next })
      return next
    })
  }

  return (
    <>
      {/* Panel utama */}
      <div id="carta-panel" className={visible ? '' : 'carta-hidden'}>
        <Header symbol={symbol} onClose={toggle} />
        <PanelContent key={symbol ?? 'idle'} symbol={symbol} />
      </div>

      {/* Toggle button — selalu visible di luar panel */}
      <button id="carta-toggle" onClick={toggle}>
        {visible ? '▶' : '◀'} CARTA
      </button>
    </>
  )
}
