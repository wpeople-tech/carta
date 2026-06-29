import './panel/panel.css'
import { MOCK_ANALYSIS } from './panel/__mocks__/mockData'
import Header from './panel/components/Header'
import SignalBar from './panel/components/SignalBar'
import SRLevels from './panel/components/SRLevels'
import Indicators from './panel/components/Indicators'
import TradeSetup from './panel/components/TradeSetup'
import CartaCall from './panel/components/CartaCall'
import Footer from './panel/components/Footer'

// Dev preview — render panel langsung tanpa Shadow DOM dan tanpa TradingView
export default function App() {
  return (
    <div style={{ display: 'flex', justifyContent: 'flex-end', minHeight: '100vh', background: '#1a1a2e' }}>
      <div id="carta-panel" style={{ position: 'relative' }}>
        <Header symbol={MOCK_ANALYSIS.tradingview_sym} onClose={() => {}} />
        <SignalBar
          signal={MOCK_ANALYSIS.signal}
          confidence={MOCK_ANALYSIS.confidence_pct}
          weeklyBias={MOCK_ANALYSIS.weekly_bias}
        />
        <div className="carta-body">
          <SRLevels levels={MOCK_ANALYSIS.support_resistance} />
          <Indicators data={MOCK_ANALYSIS.indicators[0]} />
          {MOCK_ANALYSIS.trade_setups.map(setup => (
            <TradeSetup key={setup.direction} setup={setup} />
          ))}
          <CartaCall text={MOCK_ANALYSIS.claude_call} />
        </div>
        <Footer
          generatedAt={MOCK_ANALYSIS.generated_at}
          expiresAt={MOCK_ANALYSIS.expires_at}
        />
      </div>
    </div>
  )
}
