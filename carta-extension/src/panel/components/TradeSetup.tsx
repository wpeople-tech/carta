import { useState } from 'react'
import type { TradeSetup as TradeSetupData } from '../types'
import { formatPrice } from '../utils'

interface Props {
  setup: TradeSetupData
  defaultExpanded?: boolean
}

function RRBar({ setup }: { setup: TradeSetupData }) {
  const entry = ((setup.entry_zone_low ?? 0) + (setup.entry_zone_high ?? 0)) / 2
  const sl = setup.stop_tight ?? 0
  const tp1 = setup.tp1_price ?? 0
  const tp2 = setup.tp2_price ?? 0
  const tp3 = setup.tp3_price ?? null

  if (!entry || !sl || !tp1) return null

  const risk = Math.abs(entry - sl)
  const reward1 = Math.abs(tp1 - entry)
  const reward2 = Math.abs(tp2 - entry)
  const reward3 = tp3 != null ? Math.abs(tp3 - entry) : 0

  const total = risk + (tp3 != null ? reward3 : reward2)
  if (total <= 0) return null

  const riskPct   = (risk / total) * 100
  const seg1Pct   = ((reward1 - 0) / total) * 100
  const seg2Pct   = ((reward2 - reward1) / total) * 100
  const seg3Pct   = tp3 != null ? ((reward3 - reward2) / total) * 100 : 0

  return (
    <div className="carta-rr-bar-wrap">
      <div className="carta-rr-bar-label">Risk / Reward</div>
      <div className="carta-rr-bar">
        <div className="carta-rr-bar-risk" style={{ width: `${riskPct}%` }} />
        <div className="carta-rr-bar-tp1"  style={{ width: `${seg1Pct}%` }} />
        <div className="carta-rr-bar-tp2"  style={{ width: `${seg2Pct}%` }} />
        {tp3 != null && (
          <div className="carta-rr-bar-tp3" style={{ width: `${seg3Pct}%` }} />
        )}
      </div>
      <div className="carta-rr-bar-ticks">
        <span className="carta-rr-bar-tick--sl">SL</span>
        <span className="carta-rr-bar-tick--entry">↑ Entry</span>
        <span className="carta-rr-bar-tick--tp">
          {setup.tp1_rr}R / {setup.tp2_rr}R{tp3 != null ? ` / ${setup.tp3_rr}R` : ''}
        </span>
      </div>
    </div>
  )
}

export default function TradeSetup({ setup, defaultExpanded = false }: Props) {
  const isLong = setup.direction === 'LONG'
  const [expanded, setExpanded] = useState(defaultExpanded)

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

          <RRBar setup={setup} />
        </div>
      )}
    </div>
  )
}
