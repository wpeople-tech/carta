import { useState } from 'react'

interface Props {
  text: string
}

const PREVIEW_LEN = 85

export default function CartaCall({ text }: Props) {
  const [expanded, setExpanded] = useState(false)
  const hasMore = text.length > PREVIEW_LEN

  return (
    <div className="carta-call">
      <div
        className="carta-call-header"
        onClick={() => hasMore && setExpanded(e => !e)}
        role={hasMore ? 'button' : undefined}
        aria-expanded={hasMore ? expanded : undefined}
      >
        <div className="carta-call-label">CARTA's Call</div>
        {hasMore && (
          <span className="carta-call-toggle">{expanded ? '▲' : '▼'}</span>
        )}
      </div>

      {!expanded && hasMore ? (
        <p className="carta-call-preview">
          {text.slice(0, PREVIEW_LEN)}…
        </p>
      ) : (
        <div className={`carta-call-body ${expanded || !hasMore ? 'carta-call-body--expanded' : 'carta-call-body--collapsed'}`}>
          <p className="carta-call-text">{text}</p>
        </div>
      )}
    </div>
  )
}
