// The party layer (docs/propuesta-fantasia.md, 4.1 and 4.2): something falls across the whole screen
// when she opens the app, one kind per phase. Glitter in Manifestación, cucumber slices jumping in
// Poder 2, lightning in Poder 1, stars and z's drifting up in Recarga, little opossums playing dead
// falling like leaves in Mimos. Only CSS, never over the health notes for long (the layer is
// pointer-events: none and gone in a few seconds).

import { useEffect, useMemo, useRef, useState } from 'react'
import { today } from '../domain/dates'
import './Purpurina.css'

const COLORS = ['var(--manifestacion)', 'var(--manifestacion-edge)', '#ffffff', '#ffe066']
const SHAPES = ['square', 'diamond', 'star'] as const

/** One party per phase. Each has its own thing falling (or rising) across the screen. */
export type PartyKind = 'purpurina' | 'pepinos' | 'rayos' | 'estrellas' | 'zarigueyas'

interface KindSpec {
  count: number
  size: [number, number]
  delay: number
  fall: [number, number]
  spin: [number, number]
  drift: number
}

const KINDS: Record<PartyKind, KindSpec> = {
  // Manifestación: glitter, small and plenty.
  purpurina: { count: 70, size: [4, 9], delay: 0.9, fall: [1.6, 2.5], spin: [360, 900], drift: 60 },
  // Poder 2: cucumber slices jumping up from the bottom.
  pepinos: { count: 22, size: [26, 44], delay: 0.8, fall: [1.5, 2.2], spin: [180, 540], drift: 120 },
  // Poder 1: lightning bolts, fast and straight.
  rayos: { count: 36, size: [14, 24], delay: 0.7, fall: [0.9, 1.4], spin: [-12, 12], drift: 20 },
  // Recarga: a few stars and z's drifting slowly upwards.
  estrellas: { count: 14, size: [10, 18], delay: 1.2, fall: [2.8, 3.8], spin: [-40, 40], drift: 40 },
  // Mimos: little opossums playing dead, falling like leaves.
  zarigueyas: { count: 12, size: [44, 64], delay: 1.0, fall: [2.6, 3.6], spin: [-60, 60], drift: 80 },
}

interface Particle {
  id: number
  left: number
  size: number
  delay: number
  fall: number
  spin: number
  drift: number
  /** How high a cucumber slice jumps, in vh. */
  height: number
  color: string
  shape: (typeof SHAPES)[number]
}

const between = ([min, max]: [number, number]) => min + Math.random() * (max - min)

function makeParticles(kind: PartyKind, count: number): Particle[] {
  const spec = KINDS[kind]
  const signed = kind === 'purpurina' || kind === 'pepinos'
  return Array.from({ length: count }, (_, id) => ({
    id,
    left: Math.random() * 100,
    size: between(spec.size),
    delay: Math.random() * spec.delay,
    fall: between(spec.fall),
    spin: (signed && Math.random() < 0.5 ? -1 : 1) * between(spec.spin),
    drift: (Math.random() - 0.5) * spec.drift,
    height: 35 + Math.random() * 40,
    color: COLORS[Math.floor(Math.random() * COLORS.length)]!,
    shape: SHAPES[Math.floor(Math.random() * SHAPES.length)]!,
  }))
}

/** How long the layer stays mounted: the slowest particle plus a margin. */
function durationMs(kind: PartyKind): number {
  const spec = KINDS[kind]
  return Math.round((spec.delay + spec.fall[1]) * 1000) + 300
}

/** A cucumber slice: dark rind, pale flesh, a ring of seeds. The same one Billy wears on his eyes in the spa. */
function Slice() {
  return (
    <svg viewBox="0 0 40 40" width="100%" height="100%" aria-hidden="true">
      <circle cx="20" cy="20" r="19" fill="#5c9e3a" />
      <circle cx="20" cy="20" r="16" fill="#c9eaa6" />
      <circle cx="20" cy="20" r="9.5" fill="#e4f3d3" />
      {[0, 60, 120, 180, 240, 300].map((deg) => (
        <ellipse key={deg} cx="20" cy="12.5" rx="1.6" ry="3" fill="#8fbf5a" transform={`rotate(${deg} 20 20)`} />
      ))}
    </svg>
  )
}

/** A lightning bolt in Poder 1 blue with a white core. */
function Bolt() {
  return (
    <svg viewBox="0 0 20 32" width="100%" height="100%" aria-hidden="true">
      <path d="M12 1 L3 18 h6 L7 31 L17 13 h-6 z" fill="#1cb0f6" stroke="#0b4f72" strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M11 6 L7 16 h4 L9 25" fill="none" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" opacity="0.8" />
    </svg>
  )
}

/** A gold star, or a "z", for the recharge: half of them are one, half the other. */
function StarOrZ({ z }: { z: boolean }) {
  return z ? (
    <svg viewBox="0 0 20 20" width="100%" height="100%" aria-hidden="true">
      <text x="10" y="16" textAnchor="middle" fontFamily="Nunito, system-ui, sans-serif" fontWeight="900" fontSize="18" fill="#ffc800">
        z
      </text>
    </svg>
  ) : (
    <svg viewBox="0 0 20 20" width="100%" height="100%" aria-hidden="true">
      <path d="M10 1 l2.6 5.6 6.1 0.7 -4.5 4.2 1.2 6 -5.4 -3 -5.4 3 1.2 -6 -4.5 -4.2 6.1 -0.7 z" fill="#ffc800" />
    </svg>
  )
}

/** A tiny Billy playing dead: belly up, legs in the air, x eyes, tongue out. */
function Possum() {
  return (
    <svg viewBox="0 0 90 60" width="100%" height="100%" aria-hidden="true">
      <path d="M70 44 C82 42 86 50 78 54" fill="none" stroke="#F2A7B5" strokeWidth="4" strokeLinecap="round" />
      <g stroke="#9AA0A8" strokeWidth="5" strokeLinecap="round">
        <path d="M38 34 L34 18" />
        <path d="M48 32 L47 14" />
        <path d="M58 32 L60 14" />
        <path d="M66 36 L72 20" />
      </g>
      <g fill="#F2A7B5">
        <circle cx="34" cy="17" r="3" />
        <circle cx="47" cy="13" r="3" />
        <circle cx="60" cy="13" r="3" />
        <circle cx="72" cy="19" r="3" />
      </g>
      <ellipse cx="52" cy="43" rx="24" ry="13" fill="#9AA0A8" />
      <circle cx="16" cy="32" r="6" fill="#2B2B2B" />
      <circle cx="16" cy="32" r="2.8" fill="#F2A7B5" />
      <ellipse cx="24" cy="43" rx="15" ry="12.5" fill="#F4F1EC" />
      <g stroke="#1A1A1A" strokeWidth="2" strokeLinecap="round">
        <path d="M17 38 L22 43 M22 38 L17 43" />
        <path d="M26 38 L31 43 M31 38 L26 43" />
      </g>
      <circle cx="13" cy="47" r="2.8" fill="#F28BA0" />
      <ellipse cx="22" cy="52" rx="3" ry="4.5" fill="#F28BA0" />
    </svg>
  )
}

function Shape({ kind, id }: { kind: PartyKind; id: number }) {
  if (kind === 'pepinos') return <Slice />
  if (kind === 'rayos') return <Bolt />
  if (kind === 'estrellas') return <StarOrZ z={id % 2 === 1} />
  if (kind === 'zarigueyas') return <Possum />
  return null
}

/** Which party each moment of the cycle gets (the partner's states use the same names). */
export function partyFor(moment: 'recarga' | 'poder1' | 'manifestacion' | 'poder2' | 'mimos'): PartyKind {
  return { recarga: 'estrellas', poder1: 'rayos', manifestacion: 'purpurina', poder2: 'pepinos', mimos: 'zarigueyas' }[moment] as PartyKind
}

export function reducedMotion(): boolean {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

/** What has already been celebrated since the app was opened. Closing or reloading the app forgets it. */
const celebrated = new Map<string, string>()

/**
 * Whether the celebration `name` is due for `stamp` (a date, a cycle, a phase…). The first call
 * since the app was opened says yes; the following ones, with the same stamp, say no. So it fires
 * on every opening of the app (what the users asked for) but not every time she comes back to Hoy
 * from another tab. In development, ?celebrar=1 forces every celebration.
 */
export function celebrateOnce(name: string, stamp: string): boolean {
  if (import.meta.env.DEV && new URLSearchParams(window.location.search).get('celebrar') === '1') return true
  if (reducedMotion()) return false
  if (celebrated.get(name) === stamp) return false
  celebrated.set(name, stamp)
  return true
}

/** Once per opening of the app, as long as it is still the same day. */
export function celebrateToday(name: string): boolean {
  return celebrateOnce(name, today())
}

/** Paints the browser chrome (Android's status bar, iOS standalone) in the phase colour while mounted. */
export function useThemeColor(color: string | null) {
  useEffect(() => {
    const meta = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]')
    if (!meta || !color) return
    const before = meta.content
    meta.content = color
    return () => {
      meta.content = before
    }
  }, [color])
}

/** The party layer, one kind per phase. Mount it and it plays once, then calls onDone and renders nothing. */
export function Purpurina({ kind = 'purpurina', count, onDone }: { kind?: PartyKind; count?: number; onDone?: () => void }) {
  const [alive, setAlive] = useState(true)
  const n = count ?? KINDS[kind].count
  const particles = useMemo(() => makeParticles(kind, n), [kind, n])
  // The timer runs once per mount, whatever the parent re-renders with.
  const done = useRef(onDone)
  done.current = onDone

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setAlive(false)
      done.current?.()
    }, durationMs(kind))
    return () => window.clearTimeout(timer)
  }, [kind])

  if (!alive) return null
  return (
    <div className={`purpurina purpurina--${kind}`} aria-hidden="true">
      {particles.map((p) => (
        <i
          key={p.id}
          className={kind === 'purpurina' ? `purpurina__p purpurina__p--${p.shape}` : `purpurina__p purpurina__p--${kind}`}
          style={
            {
              left: `${p.left}vw`,
              '--size': `${p.size}px`,
              '--delay': `${p.delay}s`,
              '--fall': `${p.fall}s`,
              '--spin': `${p.spin}deg`,
              '--drift': `${p.drift}px`,
              '--height': `${p.height}vh`,
              '--color': p.color,
            } as React.CSSProperties
          }
        >
          <Shape kind={kind} id={p.id} />
        </i>
      ))}
    </div>
  )
}
