import { useState, useEffect } from 'react'
import type { Analysis } from '../types'

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string

export type AnalysisState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; data: Analysis }
  | { status: 'uncharted'; reason?: string }
  | { status: 'error' }

export function useAnalysis(symbol: string | null): AnalysisState {
  const [state, setState] = useState<AnalysisState>({ status: 'idle' })

  useEffect(() => {
    if (!symbol) {
      setState({ status: 'uncharted', reason: 'Open a USDT pair on TradingView.' })
      return
    }

    if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
      setState({ status: 'error' })
      return
    }

    setState({ status: 'loading' })

    const controller = new AbortController()

    const url = new URL(`${SUPABASE_URL}/rest/v1/latest_analysis`)
    url.searchParams.set('tradingview_sym', `eq.${symbol}`)
    url.searchParams.set('select', '*,support_resistance(*),indicators(*),trade_setups(*)')
    url.searchParams.set('limit', '1')

    fetch(url.toString(), {
      headers: {
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      },
      signal: controller.signal,
    })
      .then(r => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`)
        return r.json() as Promise<Analysis[]>
      })
      .then(data => {
        console.log('data', data);
        if (data?.[0]) setState({ status: 'success', data: data[0] })
        else setState({ status: 'uncharted', reason: `${symbol} is not in CARTA's coverage.` })
      })
      .catch(err => {
        if ((err as Error).name !== 'AbortError') setState({ status: 'error' })
      })

    return () => controller.abort()
  }, [symbol])

  return state
}
