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

  return (
    <>
      <div className="carta-signal-bar">
        <div className={`carta-badge ${cls}`}>{label}</div>
        <div className="carta-confidence">
          <span className="carta-confidence-num">{confidence}%</span>
          <span className="carta-confidence-label">Confidence</span>
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
