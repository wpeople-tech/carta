import { prisma } from '@/lib/prisma'
import TopoBg from '@/components/TopoBg'
import TopoDivider from '@/components/TopoDivider'
import Navbar from '@/components/Navbar'
import LeftHeroSection from '@/sections/Home/LeftHeroSection'
import HeroPanel, { type HeroPanelData } from '@/sections/Home/HeroPanel'
import CoverageSection from '@/sections/Home/CoverageSection'
import LandingAnimated, {
  MapLegendClient,
  ProblemClient,
  McpClient,
  FeaturesClient,
  TerritoryClient,
  InstallClient,
  HowItWorksClient,
  FooterClient,
} from '@/sections/Home/LandingAnimated'

export const dynamic = 'force-dynamic'


export default async function Page() {
  // Fetch full BTC analysis for the hero panel preview
  const btcCoin = await prisma.coin.findFirst({
    where: { coin_id: 'bitcoin', is_active: true },
    select: {
      symbol: true,
      tradingview_sym: true,
      analyses: {
        orderBy: { generated_at: 'desc' },
        take: 1,
        select: {
          signal: true,
          confidence_pct: true,
          weekly_bias: true,
          claude_call: true,
          current_price: true,
          generated_at: true,
          support_resistance: {
            select: { level_type: true, strength: true, price: true },
          },
          indicators: {
            select: {
              rsi_value: true,
              rsi_status: true,
              macd_cross: true,
              price_vs_ema200: true,
              price_vs_ema20: true,
              volume_status: true,
              bb_status: true,
            },
          },
          trade_setups: {
            select: {
              direction: true,
              grade: true,
              entry_zone_low: true,
              entry_zone_high: true,
              stop_tight: true,
              risk_pct_tight: true,
              tp1_price: true,
              tp1_rr: true,
              tp2_price: true,
              tp2_rr: true,
              invalidation: true,
            },
          },
        },
      },
    },
  })

  const btcAnalysis = btcCoin?.analyses[0]
  const heroData = btcAnalysis ? {
    symbol: btcCoin.tradingview_sym.split(':')[1] ?? btcCoin.tradingview_sym,
    signal: btcAnalysis.signal as 'BUY' | 'SELL' | 'NEUTRAL',
    confidence_pct: btcAnalysis.confidence_pct,
    weekly_bias: btcAnalysis.weekly_bias as 'BULLISH' | 'BEARISH' | 'NEUTRAL',
    claude_call: btcAnalysis.claude_call,
    current_price: btcAnalysis.current_price,
    generated_at: btcAnalysis.generated_at.toISOString(),
    support_resistance: btcAnalysis.support_resistance.map(l => ({
      level_type: l.level_type as 'SUPPORT' | 'RESISTANCE',
      strength: l.strength as 'STRONG' | 'WEAK',
      price: l.price,
    })),
    indicator: btcAnalysis.indicators ? {
      rsi_value: btcAnalysis.indicators.rsi_value,
      rsi_status: btcAnalysis.indicators.rsi_status as 'OVERBOUGHT' | 'OVERSOLD' | 'NEUTRAL',
      macd_cross: btcAnalysis.indicators.macd_cross as 'BULLISH' | 'BEARISH' | 'NONE',
      price_vs_ema200: btcAnalysis.indicators.price_vs_ema200 as 'ABOVE' | 'BELOW',
      price_vs_ema20: btcAnalysis.indicators.price_vs_ema20 as 'ABOVE' | 'BELOW',
      volume_status: btcAnalysis.indicators.volume_status as 'ABOVE_AVG' | 'BELOW_AVG' | 'NORMAL',
      bb_status: btcAnalysis.indicators.bb_status as 'SQUEEZE' | 'EXPANSION' | 'NORMAL',
    } : null,
    trade_setups: btcAnalysis.trade_setups.map(s => ({
      direction: s.direction as 'LONG' | 'SHORT',
      grade: s.grade as 'A' | 'B' | 'C',
      entry_zone_low: s.entry_zone_low,
      entry_zone_high: s.entry_zone_high,
      stop_tight: s.stop_tight,
      risk_pct_tight: s.risk_pct_tight,
      tp1_price: s.tp1_price,
      tp1_rr: s.tp1_rr,
      tp2_price: s.tp2_price,
      tp2_rr: s.tp2_rr,
      invalidation: s.invalidation,
    })),
  } : null

  const coins = await prisma.coin.findMany({
    where: { is_active: true },
    orderBy: { market_cap_rank: 'asc' },
    take: 150,
    select: {
      coin_id: true,
      symbol: true,
      name: true,
      image_url: true,
      market_cap_rank: true,
      analyses: {
        orderBy: { generated_at: 'desc' },
        take: 1,
        select: {
          signal: true,
          confidence_pct: true,
          current_price: true,
          price_change_24h: true,
        },
      },
    },
  })

  const coinRows = coins.map(c => ({
    coin_id: c.coin_id,
    symbol: c.symbol,
    name: c.name,
    image_url: c.image_url ?? null,
    market_cap_rank: c.market_cap_rank ?? null,
    signal: (c.analyses[0]?.signal ?? null) as 'BUY' | 'SELL' | 'NEUTRAL' | null,
    confidence_pct: c.analyses[0]?.confidence_pct ?? null,
    current_price: c.analyses[0]?.current_price ?? null,
    price_change_24h: c.analyses[0]?.price_change_24h ?? null,
  }))

  return (
    <div className="bg-background text-ink font-reading">
      <TopoBg />
      <Navbar />

      <LandingAnimated>
        {/* Background image fills the whole hero */}
        <div style={{ position: 'relative', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/carta-agent.jpeg"
            alt=""
            aria-hidden="true"
            style={{
              position: 'absolute', inset: 0,
              width: '100%', height: '100%',
              objectFit: 'cover', objectPosition: 'center',
            }}
          />
          {/* Dark gradient overlay — uniform dark for centered layout */}
          <div style={{
            position: 'absolute', inset: 0,
            background: 'linear-gradient(to bottom, rgba(10,10,8,0.72) 0%, rgba(10,10,8,0.58) 50%, rgba(10,10,8,0.80) 100%)',
          }} />

          {/* Center: hero wording */}
          <div style={{
            position: 'relative', zIndex: 1, flex: 1,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            textAlign: 'center',
            padding: '120px 48px 64px',
          }}>
            <div style={{ maxWidth: 720, width: '100%' }}>
              <LeftHeroSection dark centered />
            </div>
          </div>

          {/* Panel — bottom, 80vw wide, default minimized */}
          <div style={{
            position: 'relative', zIndex: 1,
            display: 'flex', justifyContent: 'center',
            padding: '0 0 48px',
          }}>
            <div style={{ width: '80vw', maxWidth: 1200 }}>
              <HeroPanel defaultMinimized data={heroData as HeroPanelData | null} />
            </div>
          </div>
        </div>
      </LandingAnimated>

      <MapLegendClient />
      <TopoDivider v={1} />
      <ProblemClient />
      <McpClient />
      <TopoDivider v={4} />
      <FeaturesClient />
      <TopoDivider v={5} />
      <CoverageSection coins={coinRows} />
      <TopoDivider v={5} />
      <TerritoryClient />
      <InstallClient />
      <TopoDivider v={2} />
      <HowItWorksClient />
      <div style={{ background: '#0F0F0D' }}>
        <TopoDivider v={3} />
      </div>
      <FooterClient />
    </div>
  )
}
