import { timeAgo, isExpired } from '../utils'

interface Props {
  generatedAt: string
  expiresAt: string
}

export default function Footer({ generatedAt, expiresAt }: Props) {
  const expired = isExpired(expiresAt)
  const label = expired
    ? `Analysis ${timeAgo(generatedAt)} — refresh pending`
    : `Generated ${timeAgo(generatedAt)}`

  return (
    <div className="carta-footer">
      <span className={`carta-freshness${expired ? ' carta-freshness--expired' : ''}`}>
        {label}
      </span>
    </div>
  )
}
