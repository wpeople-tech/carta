'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import Link from 'next/link'
import { motion } from 'motion/react'
import { useWallet } from '@solana/wallet-adapter-react'
import { useWalletModal } from '@solana/wallet-adapter-react-ui'
import { fadeUp, easeOut, viewportOnce } from '@/design.config'

const BRASS = '#B08D57'
const SIGNAL_PREMIUM = '#4B3FCF'
const INK = '#0F0F0D'
const INK_MUTED = '#6B6860'
const INK_FAINT = '#9C9990'
const BG = '#F5F4F0'
const SURFACE = '#EDECEA'
const BORDER = '#D0CEC9'
const ERROR = '#C0392B'

const MONO = "'JetBrains Mono', monospace"
const SANS = "'Space Grotesk', sans-serif"

type VerifyState = 'idle' | 'signing' | 'checking' | 'eligible' | 'insufficient' | 'error'

interface Props {
  initialIsPremium: boolean
  initialWalletAddress: string | null
}

function StatusBadge({ label, color }: { label: string; color: string }) {
  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        padding: '4px 12px',
        border: `1px solid ${color}`,
        background: `${color}11`,
      }}
    >
      <div style={{ width: 6, height: 6, borderRadius: '50%', background: color }} />
      <span style={{ fontFamily: MONO, fontSize: 11, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color }}>{label}</span>
    </div>
  )
}

export default function PremiumClient({ initialIsPremium, initialWalletAddress }: Props) {
  const { publicKey, connected, signMessage, disconnect, wallet } = useWallet()
  const { setVisible } = useWalletModal()

  const [verifyState, setVerifyState] = useState<VerifyState>(
    initialIsPremium ? 'eligible' : 'idle'
  )
  const [sessionWallet, setSessionWallet] = useState<string | null>(initialWalletAddress)
  const [balance, setBalance] = useState<string | null>(null)
  const [threshold, setThreshold] = useState<string | null>(null)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  // Nonce is stable per page load — generated once on mount
  const [nonce] = useState(() => Math.random().toString(36).slice(2))

  // Refs hold the latest values so runVerification never closes over stale state.
  // This matters because WalletProviderBase fires setPublicKey + setConnected in
  // the same 'connect' handler — React 18 batches them, but a useCallback with
  // [publicKey] in its deps array may still capture the old null value if the
  // effect that calls it runs before the re-render propagates.
  const publicKeyRef = useRef(publicKey)
  const walletRef = useRef(wallet)
  const signMessageRef = useRef(signMessage)
  useEffect(() => { publicKeyRef.current = publicKey }, [publicKey])
  useEffect(() => { walletRef.current = wallet }, [wallet])
  useEffect(() => { signMessageRef.current = signMessage }, [signMessage])

  const runVerification = useCallback(async () => {
    const pk = publicKeyRef.current ?? walletRef.current?.adapter.publicKey ?? null
    const sm = signMessageRef.current
    if (!pk || !sm) return

    setVerifyState('signing')
    setErrorMsg(null)

    try {
      const walletAddress = pk.toString()
      const message = `CARTA Premium access\nWallet: ${walletAddress}\nNonce: ${nonce}`
      const encoded = new TextEncoder().encode(message)
      const signature = await sm(encoded)

      setVerifyState('checking')

      const res = await fetch('/api/auth/wallet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          walletAddress,
          message,
          signature: Array.from(signature),
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setErrorMsg(data.error ?? "Couldn't confirm your holdings. Try again.")
        setVerifyState('error')
        return
      }

      setBalance(data.balance)
      setThreshold(data.threshold)
      setSessionWallet(walletAddress)
      setVerifyState(data.eligible ? 'eligible' : 'insufficient')
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err)
      if (msg.toLowerCase().includes('reject') || msg.toLowerCase().includes('cancel')) {
        setVerifyState('idle')
      } else {
        setErrorMsg("Couldn't confirm your holdings. Try again.")
        setVerifyState('error')
      }
    }
  }, [nonce]) // nonce only — live values come from refs, no stale closure

  // Auto-trigger verification when wallet connects.
  // 50ms timeout lets React finish settling the batched publicKey+connected update
  // before runVerification reads from refs.
  useEffect(() => {
    if (!connected || verifyState !== 'idle') return
    const t = setTimeout(() => {
      const pk = publicKeyRef.current ?? walletRef.current?.adapter.publicKey ?? null
      if (pk) runVerification()
    }, 50)
    return () => clearTimeout(t)
  }, [connected, verifyState, runVerification])

  const handleDisconnect = useCallback(async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    await disconnect()
    setSessionWallet(null)
    setBalance(null)
    setThreshold(null)
    setVerifyState('idle')
  }, [disconnect])

  const displayAddress = (publicKey ?? wallet?.adapter.publicKey)?.toString() ?? sessionWallet
  const shortAddress = displayAddress
    ? `${displayAddress.slice(0, 8)}…${displayAddress.slice(-8)}`
    : null

  const formatTokens = (raw: string | null) => {
    if (!raw) return '0'
    try {
      return (BigInt(raw) / 1_000_000n).toLocaleString()
    } catch {
      return raw
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: BG, paddingTop: 96 }}>
      <div
        aria-hidden="true"
        style={{
          position: 'fixed',
          inset: 0,
          backgroundImage:
            'repeating-linear-gradient(0deg, transparent, transparent 39px, rgba(176,141,87,0.04) 40px), repeating-linear-gradient(90deg, transparent, transparent 39px, rgba(176,141,87,0.04) 40px)',
          pointerEvents: 'none',
          zIndex: 0,
        }}
      />

      <div style={{ maxWidth: 720, margin: '0 auto', padding: '64px 32px', position: 'relative', zIndex: 1 }}>
        {/* Header */}
        <motion.div variants={fadeUp} initial="hidden" animate="visible" transition={easeOut}>
          <div style={{ fontFamily: MONO, fontSize: 11, fontWeight: 600, letterSpacing: '0.18em', color: BRASS, textTransform: 'uppercase', marginBottom: 16 }}>
            CARTA Premium
          </div>
          <h1 style={{ fontFamily: SANS, fontSize: 'clamp(32px, 5vw, 52px)', fontWeight: 700, lineHeight: 1.1, letterSpacing: '-0.02em', color: INK, marginBottom: 16 }}>
            Check Your Bearing
          </h1>
          <p style={{ fontSize: 16, lineHeight: 1.7, color: INK_MUTED, marginBottom: 48 }}>
            CARTA Premium — Powered by Claude Fable 5 — is gated to $CARTA holders.
            Connect your Solana wallet to verify your holdings and unlock access.
          </p>
        </motion.div>

        {/* State card */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          transition={{ ...easeOut, delay: 0.1 }}
          style={{
            background: verifyState === 'eligible' ? '#fff' : SURFACE,
            border: `1px solid ${verifyState === 'eligible' ? SIGNAL_PREMIUM : verifyState === 'error' ? ERROR : BORDER}`,
            padding: '32px 28px',
            position: 'relative',
            boxShadow: verifyState === 'eligible' ? '0 8px 32px rgba(75,63,207,0.12), 0 2px 8px rgba(0,0,0,0.06)' : 'none',
          }}
        >
          {verifyState === 'eligible' && (
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: SIGNAL_PREMIUM }} />
          )}

          {/* IDLE — not connected */}
          {verifyState === 'idle' && !connected && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <StatusBadge label="Not connected" color={INK_FAINT} />
              <p style={{ fontFamily: MONO, fontSize: 14, color: INK_MUTED, lineHeight: 1.6 }}>
                Connect a wallet to check your bearing.
              </p>
              <button
                onClick={() => setVisible(true)}
                style={{
                  alignSelf: 'flex-start',
                  padding: '12px 28px',
                  background: SIGNAL_PREMIUM,
                  color: '#fff',
                  fontFamily: MONO,
                  fontSize: 14,
                  fontWeight: 600,
                  letterSpacing: '0.08em',
                  border: 'none',
                  cursor: 'pointer',
                }}
              >
                Connect Wallet
              </button>
            </div>
          )}

          {/* IDLE — connected but not yet verified (edge case) */}
          {verifyState === 'idle' && connected && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <StatusBadge label="Connected" color={BRASS} />
              {shortAddress && <div style={{ fontFamily: MONO, fontSize: 12, color: INK_FAINT }}>{shortAddress}</div>}
              <button
                onClick={runVerification}
                style={{
                  alignSelf: 'flex-start',
                  padding: '12px 28px',
                  background: SIGNAL_PREMIUM,
                  color: '#fff',
                  fontFamily: MONO,
                  fontSize: 14,
                  fontWeight: 600,
                  letterSpacing: '0.08em',
                  border: 'none',
                  cursor: 'pointer',
                }}
              >
                Verify Holdings
              </button>
            </div>
          )}

          {/* SIGNING */}
          {verifyState === 'signing' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <StatusBadge label="Sign requested" color={SIGNAL_PREMIUM} />
              {shortAddress && <div style={{ fontFamily: MONO, fontSize: 12, color: INK_FAINT }}>{shortAddress}</div>}
              <p style={{ fontFamily: MONO, fontSize: 14, color: INK_MUTED }}>
                Approve the signature in your wallet — no funds move.
              </p>
            </div>
          )}

          {/* CHECKING */}
          {verifyState === 'checking' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <StatusBadge label="Verifying" color={BRASS} />
              {shortAddress && <div style={{ fontFamily: MONO, fontSize: 12, color: INK_FAINT }}>{shortAddress}</div>}
              <p style={{ fontFamily: MONO, fontSize: 14, color: INK_MUTED }}>
                Checking your $CARTA holdings on-chain…
              </p>
            </div>
          )}

          {/* ELIGIBLE */}
          {verifyState === 'eligible' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <StatusBadge label="Premium Access" color={SIGNAL_PREMIUM} />
              {shortAddress && <div style={{ fontFamily: MONO, fontSize: 12, color: INK_FAINT }}>{shortAddress}</div>}
              <div style={{ padding: '20px 24px', background: `${SIGNAL_PREMIUM}09`, border: `1px solid ${SIGNAL_PREMIUM}33` }}>
                <div style={{ fontFamily: MONO, fontSize: 12, color: SIGNAL_PREMIUM, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 8 }}>
                  Access Granted
                </div>
                <p style={{ fontSize: 14, lineHeight: 1.65, color: INK_MUTED }}>
                  Premium reasoning with Claude Fable 5 is active. Multi-timeframe confluence,
                  confidence scoring, and full reasoning behind every entry, stop, and target.
                </p>
              </div>
              <button
                onClick={handleDisconnect}
                style={{
                  alignSelf: 'flex-start',
                  padding: '8px 16px',
                  background: 'transparent',
                  color: INK_FAINT,
                  fontFamily: MONO,
                  fontSize: 12,
                  letterSpacing: '0.06em',
                  border: `1px solid ${BORDER}`,
                  cursor: 'pointer',
                }}
              >
                Disconnect
              </button>
            </div>
          )}

          {/* INSUFFICIENT */}
          {verifyState === 'insufficient' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <StatusBadge label="Insufficient holdings" color={BRASS} />
              {shortAddress && <div style={{ fontFamily: MONO, fontSize: 12, color: INK_FAINT }}>{shortAddress}</div>}
              <p style={{ fontFamily: MONO, fontSize: 14, color: INK_MUTED, lineHeight: 1.6 }}>
                You&apos;re holding{' '}
                <span style={{ color: INK, fontWeight: 600 }}>{formatTokens(balance)} $CARTA</span>.{' '}
                <span style={{ color: BRASS }}>{formatTokens(threshold)} $CARTA</span> gets you Premium.
              </p>
              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                <a
                  href="https://jup.ag"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    padding: '10px 20px',
                    background: BRASS,
                    color: '#fff',
                    fontFamily: MONO,
                    fontSize: 13,
                    fontWeight: 600,
                    letterSpacing: '0.06em',
                    textDecoration: 'none',
                  }}
                >
                  Acquire $CARTA →
                </a>
                <button
                  onClick={runVerification}
                  style={{
                    padding: '10px 20px',
                    background: 'transparent',
                    color: INK_MUTED,
                    fontFamily: MONO,
                    fontSize: 13,
                    border: `1px solid ${BORDER}`,
                    cursor: 'pointer',
                  }}
                >
                  Re-check
                </button>
              </div>
            </div>
          )}

          {/* ERROR */}
          {verifyState === 'error' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <StatusBadge label="Verification failed" color={ERROR} />
              {shortAddress && <div style={{ fontFamily: MONO, fontSize: 12, color: INK_FAINT }}>{shortAddress}</div>}
              <p style={{ fontFamily: MONO, fontSize: 14, color: INK_MUTED, lineHeight: 1.6 }}>
                {errorMsg ?? "Couldn't confirm your holdings. Try again."}
              </p>
              <div style={{ display: 'flex', gap: 12 }}>
                <button
                  onClick={runVerification}
                  style={{
                    padding: '10px 20px',
                    background: SIGNAL_PREMIUM,
                    color: '#fff',
                    fontFamily: MONO,
                    fontSize: 13,
                    fontWeight: 600,
                    letterSpacing: '0.06em',
                    border: 'none',
                    cursor: 'pointer',
                  }}
                >
                  Try again
                </button>
                <button
                  onClick={handleDisconnect}
                  style={{
                    padding: '10px 20px',
                    background: 'transparent',
                    color: INK_FAINT,
                    fontFamily: MONO,
                    fontSize: 13,
                    border: `1px solid ${BORDER}`,
                    cursor: 'pointer',
                  }}
                >
                  Disconnect
                </button>
              </div>
            </div>
          )}
        </motion.div>

        {/* Back link */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
          transition={{ ...easeOut, delay: 0.2 }}
          style={{ marginTop: 32 }}
        >
          <Link href="/#roadmap" style={{ fontFamily: MONO, fontSize: 13, color: INK_FAINT, textDecoration: 'none', letterSpacing: '0.06em' }}>
            ← Back to Roadmap
          </Link>
        </motion.div>

        {/* How it works */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
          transition={{ ...easeOut, delay: 0.25 }}
          style={{ marginTop: 64, padding: '24px', borderLeft: `2px solid ${BRASS}`, background: SURFACE }}
        >
          <div style={{ fontFamily: MONO, fontSize: 10, letterSpacing: '0.12em', textTransform: 'uppercase', color: BRASS, marginBottom: 12 }}>
            How it works
          </div>
          {[
            'Connect your Solana wallet (Phantom or Solflare).',
            'Sign a message — no funds move, this is pure ownership proof.',
            'CARTA checks your $CARTA balance on-chain via a secure RPC call.',
            'If you hold the required amount, access is unlocked immediately.',
          ].map((step, i) => (
            <div key={i} style={{ display: 'flex', gap: 12, marginBottom: 8 }}>
              <span style={{ fontFamily: MONO, fontSize: 11, color: INK_FAINT, flexShrink: 0, marginTop: 2 }}>
                {String(i + 1).padStart(2, '0')}.
              </span>
              <span style={{ fontSize: 13, lineHeight: 1.6, color: INK_MUTED }}>{step}</span>
            </div>
          ))}
        </motion.div>
      </div>
    </div>
  )
}
