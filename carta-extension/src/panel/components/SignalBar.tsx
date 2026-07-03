import type { Signal, WeeklyBias } from '../types'

interface Props {
  signal: Signal
  confidence: number
  weeklyBias: WeeklyBias
}

const BADGE: Record<Signal, { cls: string; label: string }> = {
  BUY:     { cls: 'carta-badge--buy',     label: '▲ BUY' },
  SELL:    { cls: 'carta-badge--sell',    label: '▼ SELL' },
  NEUTRAL: { cls: 'carta-badge--neutral', label: '● NEUTRAL' },
}

export default function SignalBar({ signal, confidence, weeklyBias }: Props) {
  const { cls, label } = BADGE[signal]
  const sig = signal.toLowerCase()

  return (
    <>
      <div className="carta-signal-bar">
        <div className="carta-signal-bar-top">
          <div className={`carta-badge ${cls}`}>{label}</div>
          <div className="carta-confidence">
            <span className="carta-confidence-label">Confidence</span>
          </div>
        </div>

        {/* Confidence progress bar */}
        <div className="carta-conf-bar-row">
          <span className="carta-conf-bar-label-left">0%</span>
          <div className="carta-conf-bar-track">
            <div
              className={`carta-conf-bar-fill carta-conf-bar-fill--${sig}`}
              style={{ width: `${confidence}%` }}
            />
          </div>
          <span className={`carta-conf-bar-num carta-conf-num--${sig}`}>{confidence}%</span>
        </div>
      </div>

      <div className="carta-weekly-bias">
        Weekly bias:{' '}
        <span className={`carta-bias--${weeklyBias.toLowerCase()}`}>
          {weeklyBias}
        </span>
      </div>
    </>
  )
}
