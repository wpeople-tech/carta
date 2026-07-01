export function formatPrice(price: number | null | undefined): string {
  if (price == null) return '--'

  let fractionDigits = 0

  if (price < 0.0001) fractionDigits = 8
  else if (price < 0.01) fractionDigits = 6
  else if (price < 1) fractionDigits = 4
  else if (price < 1000) fractionDigits = 2

  return price.toLocaleString('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: fractionDigits,
  })
}

export function timeAgo(isoString: string): string {
  const diffMs = Date.now() - new Date(isoString).getTime()
  const hours = Math.round(diffMs / 3_600_000)
  if (hours < 1) return 'just now'
  return `${hours}h ago`
}

export function isExpired(expiresAt: string): boolean {
  return Date.now() > new Date(expiresAt).getTime()
}
