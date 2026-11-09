// Alerta de purpurina (docs/propuesta-fantasia.md, 4.1): golden glitter falls over the whole screen
// when she opens Hoy in Manifestación. In Poder 2, Billy's spa day, cucumber slices jump up from the
// bottom instead. On every opening of the app, only CSS, never over the health notes (the layer is
// pointer-events: none and gone in about three seconds).

import { useEffect, useMemo, useRef, useState } from 'react'
import { today } from '../domain/dates'
import './Purpurina.css'

const COLORS = ['var(--manifestacion)', 'var(--manifestacion-edge)', '#ffffff', '#ffe066']
const SHAPES = ['square', 'diamond', 'star'] as const
const DURATION_MS = 3200

export type PartyKind = 'purpurina' | 'pepinos'

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

function makeParticles(kind: PartyKind, count: number): Particle[] {
  const slices = kind === 'pepinos'
  return Array.from({ length: count }, (_, id) => ({
    id,
    left: Math.random() * 100,
    size: slices ? 26 + Math.random() * 18 : 4 + Math.random() * 5,
    delay: Math.random() * (slices ? 0.8 : 0.9),
    fall: slices ? 1.5 + Math.random() * 0.7 : 1.6 + Math.random() * 0.9,
    spin: (Math.random() < 0.5 ? -1 : 1) * (slices ? 180 + Math.random() * 360 : 360 + Math.random() * 540),
    drift: (Math.random() - 0.5) * (slices ? 120 : 60),
    height: 35 + Math.random() * 40,
    color: COLORS[Math.floor(Math.random() * COLORS.length)]!,
    shape: SHAPES[Math.floor(Math.random() * SHAPES.length)]!,
  }))
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

/** The party layer: glitter falling, or cucumber slices jumping. Mount it and it plays once, then calls onDone and renders nothing. */
export function Purpurina({ kind = 'purpurina', count, onDone }: { kind?: PartyKind; count?: number; onDone?: () => void }) {
  const [alive, setAlive] = useState(true)
  const n = count ?? (kind === 'pepinos' ? 22 : 70)
  const particles = useMemo(() => makeParticles(kind, n), [kind, n])
  // The timer runs once per mount, whatever the parent re-renders with.
  const done = useRef(onDone)
  done.current = onDone

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setAlive(false)
      done.current?.()
    }, DURATION_MS)
    return () => window.clearTimeout(timer)
  }, [])

  if (!alive) return null
  return (
    <div className={`purpurina purpurina--${kind}`} aria-hidden="true">
      {particles.map((p) => (
        <i
          key={p.id}
          className={kind === 'pepinos' ? 'purpurina__p purpurina__p--slice' : `purpurina__p purpurina__p--${p.shape}`}
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
          {kind === 'pepinos' && <Slice />}
        </i>
      ))}
    </div>
  )
}
