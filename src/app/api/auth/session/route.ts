import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { getIronSession } from 'iron-session'
import { sessionOptions, type SessionData } from '@/lib/session'

export async function GET() {
  const cookieStore = await cookies()
  const session = await getIronSession<SessionData>(cookieStore, sessionOptions)

  if (!session.walletAddress || !session.isPremium) {
    return NextResponse.json({ walletAddress: null, isPremium: false })
  }

  return NextResponse.json({
    walletAddress: session.walletAddress,
    isPremium: session.isPremium,
    verifiedAt: session.verifiedAt ?? null,
  })
}
