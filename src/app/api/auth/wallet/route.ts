import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { getIronSession } from 'iron-session'
import { PublicKey } from '@solana/web3.js'
import { prisma } from '@/lib/prisma'
import { sessionOptions, type SessionData } from '@/lib/session'

const CARTA_TOKEN_MINT = process.env.CARTA_TOKEN_MINT ?? ''
const MIN_HOLD_THRESHOLD = BigInt(
  /^\d+$/.test(process.env.MIN_HOLD_THRESHOLD ?? '')
    ? process.env.MIN_HOLD_THRESHOLD!
    : '0'
)
const SOLANA_RPC_URL = process.env.SOLANA_RPC_URL ?? 'https://api.mainnet-beta.solana.com'

async function verifySignature(walletAddress: string, message: string, signature: number[]): Promise<boolean> {
  try {
    const pubkey = new PublicKey(walletAddress)
    // Copy into a plain ArrayBuffer — Web Crypto rejects Uint8Array<ArrayBufferLike>
    const publicKeyBytes = pubkey.toBytes().buffer.slice(0) as ArrayBuffer

    const cryptoKey = await crypto.subtle.importKey(
      'raw',
      publicKeyBytes,
      { name: 'Ed25519' },
      false,
      ['verify']
    )

    const messageBytes = new TextEncoder().encode(message)
    const signatureBytes = new Uint8Array(signature)

    return await crypto.subtle.verify('Ed25519', cryptoKey, signatureBytes, messageBytes)
  } catch {
    return false
  }
}

async function getCartaBalance(walletAddress: string): Promise<bigint> {
  if (!CARTA_TOKEN_MINT) return 0n

  try {
    const res = await fetch(SOLANA_RPC_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 1,
        method: 'getTokenAccountsByOwner',
        params: [
          walletAddress,
          { mint: CARTA_TOKEN_MINT },
          { encoding: 'jsonParsed' },
        ],
      }),
      next: { revalidate: 0 },
    })

    if (!res.ok) return 0n

    const json = await res.json()
    const accounts: { account: { data: { parsed: { info: { tokenAmount: { amount: string } } } } } }[] =
      json?.result?.value ?? []

    return accounts.reduce((sum, acc) => {
      return sum + BigInt(acc.account.data.parsed.info.tokenAmount.amount)
    }, 0n)
  } catch {
    return 0n
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { walletAddress, message, signature } = body as {
      walletAddress: string
      message: string
      signature: number[]
    }

    if (!walletAddress || !message || !Array.isArray(signature)) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const signatureValid = await verifySignature(walletAddress, message, signature)
    if (!signatureValid) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
    }

    const balance = await getCartaBalance(walletAddress)
    const eligible = balance >= MIN_HOLD_THRESHOLD

    const now = new Date()
    const sessionExpiresAt = new Date(now.getTime() + (sessionOptions.cookieOptions?.maxAge ?? 86400) * 1000)

    await prisma.premiumAccess.upsert({
      where: { wallet_address: walletAddress },
      create: {
        wallet_address: walletAddress,
        last_verified_at: now,
        last_balance: balance.toString(),
        session_expires_at: sessionExpiresAt,
      },
      update: {
        last_verified_at: now,
        last_balance: balance.toString(),
        session_expires_at: eligible ? sessionExpiresAt : now,
      },
    })

    if (eligible) {
      const cookieStore = await cookies()
      const session = await getIronSession<SessionData>(cookieStore, sessionOptions)
      session.walletAddress = walletAddress
      session.isPremium = true
      session.verifiedAt = now.getTime()
      await session.save()
    }

    return NextResponse.json({
      eligible,
      balance: balance.toString(),
      threshold: MIN_HOLD_THRESHOLD.toString(),
    })
  } catch (err) {
    console.error('[wallet/route] Error:', err)
    return NextResponse.json({ error: "Couldn't confirm your holdings. Try again." }, { status: 500 })
  }
}
