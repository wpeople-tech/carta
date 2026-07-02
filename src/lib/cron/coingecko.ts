import { COINGECKO_RATE_LIMIT_WAIT_MS } from './constants'

const BASE = 'https://api.coingecko.com/api/v3'

function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

export interface MarketCoin {
  id: string
  symbol: string
  name: string
  image: string
  current_price: number
  price_change_percentage_24h: number
  market_cap_rank: number
  market_cap: number
}

export async function fetchMarketBatch(coinIds: string[]): Promise<Map<string, MarketCoin>> {
  const result = new Map<string, MarketCoin>()
  console.log('Starting market batch fetch...');
  console.log(`coinIds: ${JSON.stringify(coinIds)}`);

  for (let i = 0; i < coinIds.length; i += 50) {
    const batch = coinIds.slice(i, i + 50)
    const url = `${BASE}/coins/markets?vs_currency=usd&ids=${batch.join(',')}&order=market_cap_desc&per_page=250&sparkline=false`
    for (let attempt = 0; attempt < 3; attempt++) {
      const r = await fetch(url, { signal: AbortSignal.timeout(15_000) })
      if (r.status === 429) {
        await sleep(COINGECKO_RATE_LIMIT_WAIT_MS)
        continue
      }
      if (!r.ok) break
      const data: MarketCoin[] = await r.json()
      for (const coin of data) {
        if (coin.market_cap >= 1_000_000) result.set(coin.id, coin)
      }
      break
    }
    if (i + 50 < coinIds.length) await sleep(1_500)
  }
  console.log(`market completed: ${JSON.stringify(result)}`);
  return result
}

export interface OhlcvData {
  close: number[]
  high: number[]
  low: number[]
}

export async function fetchOhlcv(coinId: string): Promise<OhlcvData | null> {
  const url = `${BASE}/coins/${coinId}/ohlc?vs_currency=usd&days=365`
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const r = await fetch(url, { signal: AbortSignal.timeout(15_000) })
      if (r.status === 429) {
        await sleep(COINGECKO_RATE_LIMIT_WAIT_MS)
        continue
      }
      if (!r.ok) return null
      const data = await r.json()
      if (!Array.isArray(data) || data.length < 30) return null
      // data is [[timestamp, open, high, low, close], ...]
      return {
        close: data.map((d: [number, number, number, number, number]) => d[4]),
        high: data.map((d: [number, number, number, number, number]) => d[2]),
        low: data.map((d: [number, number, number, number, number]) => d[3]),
      }
    } catch {
      await sleep(5_000)
    }
  }
  return null
}

export async function fetchTopCoins(limit = 100): Promise<MarketCoin[]> {
  const result: MarketCoin[] = []
  let page = 1
  while (result.length < limit) {
    const url = `${BASE}/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=100&page=${page}&sparkline=false`
    for (let attempt = 0; attempt < 3; attempt++) {
      const r = await fetch(url, { signal: AbortSignal.timeout(15_000) })
      if (r.status === 429) {
        await sleep(COINGECKO_RATE_LIMIT_WAIT_MS)
        continue
      }
      if (!r.ok) break
      const data: MarketCoin[] = await r.json()
      result.push(...data.slice(0, limit - result.length))
      break
    }
    if (result.length >= limit) break
    page++
    await sleep(1_500)
  }
  return result
}
