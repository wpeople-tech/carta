import type { SRLevel } from '../types'
import { formatPrice } from '../utils'

interface Props {
  levels: SRLevel[]
  livePrice?: number | null
}

const DOT_CLASS: Record<string, string> = {
  RESISTANCE_STRONG: 'carta-dot--strong-res',
  RESISTANCE_WEAK: 'carta-dot--weak-res',
  SUPPORT_STRONG: 'carta-dot--strong-sup',
  SUPPORT_WEAK: 'carta-dot--weak-sup',
}

const LABEL: Record<string, string> = {
  RESISTANCE_STRONG: 'Strong Resistance',
  RESISTANCE_WEAK: 'Weak Resistance',
  SUPPORT_STRONG: 'Strong Support',
  SUPPORT_WEAK: 'Weak Support',
}

export default function SRLevels({ levels, livePrice }: Props) {
  const resistances = levels
    .filter(l => l.level_type === 'RESISTANCE')
    .sort((a, b) => b.price - a.price)

  const supports = levels
    .filter(l => l.level_type === 'SUPPORT')
    .sort((a, b) => b.price - a.price)

  // Find nearest S/R and compute distance
  const nearestSup = supports.length > 0 ? supports[0] : null
  const nearestRes = resistances.length > 0 ? resistances[resistances.length - 1] : null
  const distToSup = livePrice && nearestSup
    ? ((livePrice - nearestSup.price) / nearestSup.price) * 100
    : null
  const distToRes = livePrice && nearestRes
    ? ((nearestRes.price - livePrice) / livePrice) * 100
    : null

  // Price ladder: position of livePrice between nearest sup and res
  const ladderPct = livePrice && nearestSup && nearestRes
    ? Math.max(0, Math.min(100,
      ((livePrice - nearestSup.price) / (nearestRes.price - nearestSup.price)) * 100
    ))
    : 50

  const renderRow = (level: SRLevel) => {
    const key = `${level.level_type}_${level.strength}`
    return (
      <div key={`${level.level_type}-${level.price}`} className="carta-sr-row">
        <div className="carta-sr-label">
          <span className={DOT_CLASS[key]} />
          {LABEL[key].split(' ').filter(item =>
            item
              .toLowerCase()
              .includes("resistance") ||
            item
              .toLowerCase()
              .includes("support")
          )}
        </div>
        <div className="carta-sr-price">${formatPrice(level.price)}</div>
      </div>
    )
  }

  return (
    <div className="carta-section">
      <div className="carta-section-label">Support &amp; Resistance · Daily</div>
      <div className="carta-sr-ladder-wrap">
        <div className="carta-sr-list">
          {resistances.map(renderRow)}

          {/* Live price row between resistance and support */}
          {livePrice != null && (
            <div className="carta-sr-row carta-sr-row--current">
              <div className="carta-sr-current-label">
                ▶ CURRENT
                {distToRes != null && (
                  <span className="carta-sr-current-dist"> · {distToRes.toFixed(1)}% to res</span>
                )}
              </div>
              <div className="carta-sr-current-price">${formatPrice(livePrice)}</div>
            </div>
          )}

          {supports.map(renderRow)}

          {livePrice != null && distToSup != null && (
            <div className="carta-sr-dist-row">
              <span>{distToSup.toFixed(1)}% above nearest support</span>
            </div>
          )}
        </div>

        {/* Vertical price position ladder */}
        {livePrice != null && nearestSup && nearestRes && (
          <div className="carta-sr-ladder">
            <div className="carta-sr-ladder-res" style={{ flex: 100 - ladderPct }} />
            <div className="carta-sr-ladder-gap">
              <span className="carta-sr-ladder-dot" />
            </div>
            <div className="carta-sr-ladder-sup" style={{ flex: ladderPct }} />
          </div>
        )}
      </div>
    </div>
  )
}
