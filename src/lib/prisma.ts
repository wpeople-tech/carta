
import { PrismaClient } from '@/generated/prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

// DATABASE_URL = Supabase pooled connection (pgBouncer, port 6543)
// Used at runtime — safe for serverless / Vercel Edge.
function createPrismaClient() {
  const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
  return new PrismaClient({ adapter })
}

declare global {
  // eslint-disable-next-line no-var
  var _prisma: PrismaClient | undefined
}

// Reuse client across hot-reloads in dev; create fresh in prod.
export const prisma: PrismaClient =
  globalThis._prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== 'production') {
  globalThis._prisma = prisma
}
