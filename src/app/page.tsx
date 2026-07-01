import { prisma } from '@/lib/prisma'
import TopoBg from '@/components/TopoBg'
import TopoDivider from '@/components/TopoDivider'
import Navbar from '@/components/Navbar'
import LeftHeroSection from '@/sections/Home/LeftHeroSection'
import HeroPanel from '@/sections/Home/HeroPanel'
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
              <HeroPanel defaultMinimized />
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
