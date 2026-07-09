import { cookies } from 'next/headers'
import { getIronSession } from 'iron-session'
import { sessionOptions, type SessionData } from '@/lib/session'
import PremiumClient from './PremiumClient'

export const dynamic = 'force-dynamic'

export default async function PremiumPage() {
  const cookieStore = await cookies()
  const session = await getIronSession<SessionData>(cookieStore, sessionOptions)
  console.log('session', session)
  return (
    <PremiumClient
      initialIsPremium={session.isPremium ?? false}
      initialWalletAddress={session.walletAddress ?? null}
    />
  )
}
