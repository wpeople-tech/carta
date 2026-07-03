import type { Indicators as IndicatorsData } from '../types'

interface Props {
  data: IndicatorsData
}

type Tone = 'bullish' | 'bearish' | 'neutral'

function rssTone(s: string): Tone {
  if (s === 'OVERBOUGHT') return 'bearish'
  if (s === 'OVERSOLD') return 'bullish'
  return 'neutral'
}

function emaTone(pos: string): Tone {
  return pos === 'ABOVE' ? 'bullish' : 'bearish'
}

function volTone(s: string): Tone {
  if (s === 'ABOVE_AVG') return 'bullish'
  if (s === 'BELOW_AVG') return 'bearish'
  return 'neutral'
}

function cap(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1).toLowerCase()
}

export default function Indicators({ data }: Props) {
  const items: { label: string; value: string; tone: Tone }[] = [
    {
      label: 'RSI (14)',
      value: `${data.rsi_value} · ${cap(data.rsi_status)}`,
      tone: rssTone(data.rsi_status),
    },
    {
      label: 'MACD',
      value: data.macd_cross === 'BULLISH' ? 'Bullish Cross'
           : data.macd_cross === 'BEARISH' ? 'Bearish Cross'
           : 'No Cross',
      tone: (data.macd_cross === 'BULLISH' ? 'bullish'
           : data.macd_cross === 'BEARISH' ? 'bearish'
           : 'neutral') as Tone,
    },
    {
      label: 'EMA 200',
      value: cap(data.price_vs_ema200),
      tone: emaTone(data.price_vs_ema200),
    },
    {
      label: 'EMA 20',
      value: cap(data.price_vs_ema20),
      tone: emaTone(data.price_vs_ema20),
    },
    {
      label: 'Bollinger',
      value: cap(data.bb_status),
      tone: (data.bb_status === 'EXPANSION' ? 'bullish' : 'neutral') as Tone,
    },
    {
      label: 'Volume',
      value: data.volume_status === 'ABOVE_AVG' ? 'Above Avg'
           : data.volume_status === 'BELOW_AVG' ? 'Below Avg'
           : 'Normal',
      tone: volTone(data.volume_status),
    },
  ]

  return (
    <div className="carta-section">
      <div className="carta-section-label">Indicators</div>
      <div className="carta-indicator-grid">
        {items.map(item => (
          <div
            key={item.label}
            className={`carta-indicator carta-ind-tile--${item.tone}`}
          >
            <div className="carta-ind-label">{item.label}</div>
            <span className={`carta-ind-pill carta-ind-pill--${item.tone}`}>
              {item.value}
            </span>
          </div>
        ))}

        {/* ATR row — spans full width */}
        <div className="carta-ind-atr">
          <span>ATR (14)</span>
          <span style={{ fontWeight: 700, color: 'var(--carta-ink-muted)' }}>
            {data.atr_value}
          </span>
        </div>
      </div>
    </div>
  )
}
