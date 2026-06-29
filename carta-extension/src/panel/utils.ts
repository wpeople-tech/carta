export function formatPrice(price: number | null | undefined): string {
  if (price === null || price === undefined) return '--'
  return Number(price).toLocaleString('en-US', {
    minimumFractionDigits: price < 1 ? 4 : 0,
    maximumFractionDigits: price < 1 ? 6 : 0,
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
