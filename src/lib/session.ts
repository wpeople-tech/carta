import type { SessionOptions, IronSession } from 'iron-session'

export interface SessionData {
  walletAddress?: string
  isPremium?: boolean
  verifiedAt?: number
}

export const sessionOptions: SessionOptions = {
  password: process.env.SESSION_SECRET as string,
  cookieName: 'carta-premium-session',
  cookieOptions: {
    secure: process.env.NODE_ENV === 'production',
    maxAge: 86400, // 24 hours
  },
}

export type CartaSession = IronSession<SessionData>
