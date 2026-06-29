import type { SRLevel } from '../types'
import { formatPrice } from '../utils'

interface Props {
  levels: SRLevel[]
}

const DOT_CLASS: Record<string, string> = {
  RESISTANCE_STRONG: 'carta-dot--strong-res',
  RESISTANCE_WEAK:   'carta-dot--weak-res',
  SUPPORT_STRONG:    'carta-dot--strong-sup',
  SUPPORT_WEAK:      'carta-dot--weak-sup',
}

const LABEL: Record<string, string> = {
  RESISTANCE_STRONG: 'Strong Resistance',
  RESISTANCE_WEAK:   'Weak Resistance',
  SUPPORT_STRONG:    'Strong Support',
  SUPPORT_WEAK:      'Weak Support',
}

export default function SRLevels({ levels }: Props) {
  const resistances = levels
    .filter(l => l.level_type === 'RESISTANCE')
    .sort((a, b) => b.price - a.price)

  const supports = levels
    .filter(l => l.level_type === 'SUPPORT')
    .sort((a, b) => b.price - a.price)

  const renderRow = (level: SRLevel) => {
    const key = `${level.level_type}_${level.strength}`
    return (
      <div key={`${level.level_type}-${level.price}`} className="carta-sr-row">
        <div className="carta-sr-label">
          <span className={DOT_CLASS[key]} />
          {LABEL[key]}
        </div>
        <div className="carta-sr-price">${formatPrice(level.price)}</div>
      </div>
    )
  }

  return (
    <div className="carta-section">
      <div className="carta-section-label">Support &amp; Resistance · Daily</div>
      <div className="carta-sr-list">
        {resistances.map(renderRow)}
        {supports.map(renderRow)}
      </div>
    </div>
  )
}
