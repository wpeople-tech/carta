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
        <section
          className="grid grid-cols-1 lg:grid-cols-2 items-center px-8 md:px-16 py-28"
          style={{ minHeight: '100vh', gap: 64, maxWidth: 1280, margin: '0 auto', position: 'relative', zIndex: 1 }}
        >
          <LeftHeroSection />
          <HeroPanel />
        </section>
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
