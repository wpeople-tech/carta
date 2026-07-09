'use client'

import { useRef } from 'react'
import { motion, useInView, useReducedMotion } from 'motion/react'
import Link from 'next/link'
import { fadeUp, staggerContainer, easeOut, easeOutFast, viewportOnce } from '@/design.config'

const BRASS = '#B08D57'
const SIGNAL_PREMIUM = '#4B3FCF'
const ROUTE = '#C9BFA8'
const INK = '#0F0F0D'
const INK_MUTED = '#6B6860'
const INK_FAINT = '#9C9990'
const BG = '#F5F4F0'
const SURFACE = '#EDECEA'
const BORDER = '#D0CEC9'

const MONO = "'JetBrains Mono', monospace"
const SANS = "'Space Grotesk', sans-serif"

const WAYPOINTS = [
  {
    id: 'now',
    label: 'NOW',
    title: 'Core Engine',
    color: BRASS,
    solid: true,
    hero: false,
    muted: false,
    body: 'Live across top pairs. TA-Lib and scipy clustering under the hood, every call validated against hard assertions before it reaches you.',
    cta: null,
  },
  {
    id: 'next',
    label: 'NEXT',
    title: 'CARTA Premium',
    subtitle: 'Powered by Claude Fable 5',
    color: SIGNAL_PREMIUM,
    solid: false,
    hero: true,
    muted: false,
    body: 'The reasoning layer gets a new engine. Multi-timeframe confluence. Confidence scoring on every call. Reasoning behind every entry, stop, and target — not just the numbers.',
    meta: 'Top 30 pairs by market cap · $CARTA holders only',
    cta: { label: 'Get Access →', href: '/premium' },
  },
  {
    id: 'later',
    label: 'LATER',
    title: 'On Your Chart',
    color: ROUTE,
    solid: false,
    hero: false,
    muted: true,
    body: 'Premium reasoning ships inside the CARTA Chrome extension. Live on TradingView. No second screen, no tab switching.',
    cta: null,
  },
] as const

function RouteConnector({ solid }: { solid: boolean }) {
  if (solid) {
    return (
      <div style={{ flex: 1, height: 2, background: BRASS, alignSelf: 'center', minWidth: 0 }} />
    )
  }
  return (
    <div
      style={{
        flex: 1,
        height: 2,
        backgroundImage: `repeating-linear-gradient(90deg, ${ROUTE} 0, ${ROUTE} 8px, transparent 8px, transparent 16px)`,
        alignSelf: 'center',
        minWidth: 0,
      }}
    />
  )
}

function WaypointDot({ color, hero }: { color: string; hero: boolean }) {
  return (
    <div
      style={{
        width: hero ? 16 : 12,
        height: hero ? 16 : 12,
        borderRadius: '50%',
        background: hero ? color : BG,
        border: `2px solid ${color}`,
        flexShrink: 0,
        boxShadow: hero ? `0 0 0 4px ${color}22` : 'none',
        transition: 'box-shadow 0.3s',
      }}
    />
  )
}

function CompassNeedle({ inView }: { inView: boolean }) {
  const prefersReduced = useReducedMotion()

  const finalX = 'calc(33.33% - 8px)'

  if (prefersReduced) {
    return (
      <div
        style={{
          position: 'absolute',
          top: '50%',
          transform: `translateY(-50%) translateX(${finalX})`,
          left: 0,
          pointerEvents: 'none',
        }}
      >
        <svg width="16" height="20" viewBox="0 0 16 20" fill="none">
          <path d="M8 0L14 12H8V20L2 8H8V0Z" fill={BRASS} opacity="0.9" />
        </svg>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ x: 0 }}
      animate={inView ? { x: finalX } : { x: 0 }}
      transition={{ duration: 1.4, ease: [0.22, 0.97, 0.36, 1], delay: 0.3 }}
      style={{
        position: 'absolute',
        top: '50%',
        translateY: '-50%',
        left: 0,
        pointerEvents: 'none',
      }}
    >
      <svg width="16" height="20" viewBox="0 0 16 20" fill="none">
        <path d="M8 0L14 12H8V20L2 8H8V0Z" fill={BRASS} opacity="0.9" />
      </svg>
    </motion.div>
  )
}

export default function RoadmapSection() {
  const routeRef = useRef<HTMLDivElement>(null)
  const inView = useInView(routeRef, { once: true, margin: '-80px' })

  return (
    <section
      id="roadmap"
      style={{
        background: BG,
        padding: '100px 48px',
        borderTop: `1px solid ${BORDER}`,
        borderBottom: `1px solid ${BORDER}`,
        position: 'relative',
        zIndex: 1,
        overflow: 'hidden',
      }}
    >
      {/* Subtle parchment grain overlay */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage:
            'repeating-linear-gradient(0deg, transparent, transparent 39px, rgba(176,141,87,0.04) 40px), repeating-linear-gradient(90deg, transparent, transparent 39px, rgba(176,141,87,0.04) 40px)',
          pointerEvents: 'none',
        }}
      />

      <div style={{ maxWidth: 1280, margin: '0 auto', position: 'relative' }}>
        {/* Eyebrow */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
          transition={easeOut}
        >
          <div
            style={{
              fontFamily: MONO,
              fontSize: 12,
              fontWeight: 600,
              letterSpacing: '0.18em',
              color: BRASS,
              textTransform: 'uppercase',
              marginBottom: 20,
            }}
          >
            Roadmap
          </div>
          <h2
            style={{
              fontFamily: SANS,
              fontSize: 'clamp(28px, 4vw, 48px)',
              fontWeight: 700,
              lineHeight: 1.1,
              letterSpacing: '-0.02em',
              color: INK,
              marginBottom: 16,
            }}
          >
            The Next Bearing
          </h2>
          <p
            style={{
              fontSize: 17,
              lineHeight: 1.7,
              color: INK_MUTED,
              maxWidth: 640,
            }}
          >
            CARTA is charting new waters. The reasoning engine behind every call is moving to Claude
            Fable 5, Anthropic&apos;s newest and most capable model — the sharpest CARTA has ever
            read a chart.
          </p>
        </motion.div>

        {/* Route line with waypoint dots */}
        <div ref={routeRef} style={{ marginTop: 64, marginBottom: 0, position: 'relative' }}>
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={viewportOnce}
            transition={{ ...easeOut, delay: 0.2 }}
          >
            {/* The route track */}
            <div style={{ display: 'flex', alignItems: 'center', position: 'relative', gap: 0 }}>
              {/* Compass needle animates over the route */}
              <CompassNeedle inView={inView} />

              {/* Waypoint 1 dot */}
              <WaypointDot color={BRASS} hero={false} />
              {/* NOW → NEXT: solid brass */}
              <RouteConnector solid={true} />
              {/* Waypoint 2 dot */}
              <WaypointDot color={SIGNAL_PREMIUM} hero={true} />
              {/* NEXT → LATER: dotted route */}
              <RouteConnector solid={false} />
              {/* Waypoint 3 dot */}
              <WaypointDot color={ROUTE} hero={false} />
            </div>

            {/* Labels under the dots */}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 10 }}>
              {WAYPOINTS.map(wp => (
                <div
                  key={wp.id}
                  style={{
                    fontFamily: MONO,
                    fontSize: 11,
                    fontWeight: 700,
                    letterSpacing: '0.14em',
                    textTransform: 'uppercase',
                    color: wp.hero ? SIGNAL_PREMIUM : wp.muted ? INK_FAINT : BRASS,
                  }}
                >
                  {wp.label}
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Waypoint cards */}
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
          className="grid grid-cols-1 lg:grid-cols-3"
          style={{ gap: 20, marginTop: 40 }}
        >
          {WAYPOINTS.map((wp, idx) => (
            <motion.div
              key={wp.id}
              variants={fadeUp}
              transition={{ ...easeOutFast, delay: idx * 0.08 }}
              style={{
                background: wp.hero ? '#fff' : SURFACE,
                border: `1px solid ${wp.hero ? SIGNAL_PREMIUM : BORDER}`,
                padding: wp.hero ? '32px 28px 28px' : '24px 24px 20px',
                position: 'relative',
                boxShadow: wp.hero
                  ? '0 8px 32px rgba(75,63,207,0.12), 0 2px 8px rgba(0,0,0,0.06)'
                  : 'none',
              }}
            >
              {/* Accent bar on hero */}
              {wp.hero && (
                <div
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: 3,
                    background: SIGNAL_PREMIUM,
                  }}
                />
              )}

              {/* Card header */}
              <div style={{ marginBottom: 12 }}>
                <div
                  style={{
                    fontFamily: MONO,
                    fontSize: 10,
                    fontWeight: 600,
                    letterSpacing: '0.14em',
                    textTransform: 'uppercase',
                    color: wp.hero ? SIGNAL_PREMIUM : wp.muted ? INK_FAINT : BRASS,
                    marginBottom: 6,
                  }}
                >
                  {wp.label}
                </div>
                <div
                  style={{
                    fontFamily: SANS,
                    fontSize: wp.hero ? 22 : 18,
                    fontWeight: 700,
                    color: wp.muted ? INK_MUTED : INK,
                    lineHeight: 1.2,
                  }}
                >
                  {wp.title}
                </div>
                {'subtitle' in wp && wp.subtitle && (
                  <div
                    style={{
                      fontFamily: MONO,
                      fontSize: 12,
                      color: SIGNAL_PREMIUM,
                      marginTop: 4,
                      letterSpacing: '0.04em',
                    }}
                  >
                    {wp.subtitle}
                  </div>
                )}
              </div>

              {/* Body */}
              <p
                style={{
                  fontSize: 14,
                  lineHeight: 1.65,
                  color: wp.muted ? INK_FAINT : INK_MUTED,
                  marginBottom: 'meta' in wp && wp.meta ? 12 : 0,
                }}
              >
                {wp.body}
              </p>

              {'meta' in wp && wp.meta && (
                <div
                  style={{
                    fontFamily: MONO,
                    fontSize: 11,
                    color: SIGNAL_PREMIUM,
                    letterSpacing: '0.06em',
                    marginBottom: 20,
                    opacity: 0.85,
                  }}
                >
                  {wp.meta}
                </div>
              )}

              {wp.cta && (
                <Link
                  href={wp.cta.href}
                  style={{
                    display: 'inline-block',
                    marginTop: 4,
                    padding: '10px 20px',
                    background: SIGNAL_PREMIUM,
                    color: '#fff',
                    fontFamily: MONO,
                    fontSize: 13,
                    fontWeight: 600,
                    letterSpacing: '0.06em',
                    textDecoration: 'none',
                    transition: 'opacity 0.2s',
                  }}
                  onMouseEnter={e => ((e.target as HTMLElement).style.opacity = '0.85')}
                  onMouseLeave={e => ((e.target as HTMLElement).style.opacity = '1')}
                >
                  {wp.cta.label}
                </Link>
              )}
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
