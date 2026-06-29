interface Props {
  symbol: string | null
  onClose: () => void
}

export default function Header({ symbol, onClose }: Props) {
  return (
    <div className="carta-header">
      <div className="carta-header-left">
        <span className="carta-dot" />
        CARTA
      </div>
      <div className="carta-ticker">
        {symbol ? `${symbol} · Daily` : '--'}
      </div>
      <button className="carta-close" onClick={onClose} aria-label="Close CARTA">
        ✕
      </button>
    </div>
  )
}
