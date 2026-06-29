import { useState } from 'react'
import type { TradeSetup as TradeSetupData } from '../types'
import { formatPrice } from '../utils'

interface Props {
  setup: TradeSetupData
}

export default function TradeSetup({ setup }: Props) {
  const isLong = setup.direction === 'LONG'
  const [expanded, setExpanded] = useState(isLong)

  return (
    <div className="carta-section">
      <div
        className="carta-section-label carta-section-toggle"
        onClick={() => setExpanded(e => !e)}
        role="button"
        aria-expanded={expanded}
      >
        Trade Setup · {isLong ? 'Long' : 'Short'}
        <span className={`carta-grade carta-grade--${setup.grade.toLowerCase()}`}>
          {setup.grade}
        </span>
        <span className="carta-toggle-icon">{expanded ? '▲' : '▼'}</span>
      </div>

      {expanded && (
        <div className="carta-setup-rows">
          <div className="carta-setup-row">
            <span className="carta-setup-label">Entry Zone</span>
            <span className="carta-setup-value">
              ${formatPrice(setup.entry_zone_low)} – ${formatPrice(setup.entry_zone_high)}
            </span>
          </div>
          <div className="carta-setup-row">
            <span className="carta-setup-label">Stop (tight)</span>
            <span className="carta-setup-value carta-setup-value--sl">
              ${formatPrice(setup.stop_tight)} · -{setup.risk_pct_tight}%
            </span>
          </div>
          <div className="carta-setup-row">
            <span className="carta-setup-label">Stop (safe)</span>
            <span className="carta-setup-value carta-setup-value--sl">
              ${formatPrice(setup.stop_safe)} · -{setup.risk_pct_safe}%
            </span>
          </div>
          <div className="carta-setup-row">
            <span className="carta-setup-label">TP1</span>
            <span className="carta-setup-value carta-setup-value--tp">
              ${formatPrice(setup.tp1_price)} · +{setup.tp1_rr}R
            </span>
          </div>
          <div className="carta-setup-row">
            <span className="carta-setup-label">TP2</span>
            <span className="carta-setup-value carta-setup-value--tp">
              ${formatPrice(setup.tp2_price)} · +{setup.tp2_rr}R
            </span>
          </div>
          {setup.tp3_price !== null && (
            <div className="carta-setup-row">
              <span className="carta-setup-label">TP3</span>
              <span className="carta-setup-value carta-setup-value--tp">
                ${formatPrice(setup.tp3_price)} · +{setup.tp3_rr}R
              </span>
            </div>
          )}
          <div className="carta-setup-row">
            <span className="carta-setup-label">Trigger</span>
            <span className="carta-setup-value">{setup.trigger_note}</span>
          </div>
          <div className="carta-setup-row">
            <span className="carta-setup-label">Invalidation</span>
            <span className="carta-setup-value carta-setup-value--sl">
              {setup.invalidation}
            </span>
          </div>
          {setup.setup_note && (
            <div className="carta-setup-note">{setup.setup_note}</div>
          )}
        </div>
      )}
    </div>
  )
}
