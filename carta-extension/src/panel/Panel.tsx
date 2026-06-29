import { useState, useEffect } from 'react'
import { useSymbol } from './hooks/useSymbol'
import { useAnalysis } from './hooks/useAnalysis'
import Header from './components/Header'
import SignalBar from './components/SignalBar'
import SRLevels from './components/SRLevels'
import Indicators from './components/Indicators'
import TradeSetup from './components/TradeSetup'
import CartaCall from './components/CartaCall'
import Footer from './components/Footer'

// Guard chrome API — tidak tersedia di dev mode
const storage = typeof chrome !== 'undefined' && chrome.storage?.local
  ? chrome.storage.local
  : null

export default function Panel() {
  const [visible, setVisible] = useState(true)
  const symbol = useSymbol()
  const state = useAnalysis(symbol)

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
      {/* Toggle button — selalu visible di luar panel */}
      <button id="carta-toggle" className="carta-toggle-btn" onClick={toggle}>
        {visible ? '◀' : '▶'} CARTA
      </button>

      {/* Panel utama */}
      <div id="carta-panel" className={visible ? '' : 'carta-hidden'}>
        <Header symbol={symbol} onClose={toggle} />

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
            <div className="carta-body">
              <SRLevels levels={state.data.support_resistance} />
              {state.data.indicators[0] && (
                <Indicators data={state.data.indicators[0]} />
              )}
              {state.data.trade_setups.map(setup => (
                <TradeSetup key={setup.direction} setup={setup} />
              ))}
              <CartaCall text={state.data.claude_call} />
            </div>
            <Footer
              generatedAt={state.data.generated_at}
              expiresAt={state.data.expires_at}
            />
          </>
        )}
      </div>
    </>
  )
}
