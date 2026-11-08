// Alerta de purpurina (docs/propuesta-fantasia.md, 4.1): golden glitter falls over the whole screen
// when she opens Hoy in Manifestación. On every opening of the app, only CSS, never over the health notes (it is
// pointer-events: none and gone in under three seconds).

import { useEffect, useMemo, useRef, useState } from 'react'
import { today } from '../domain/dates'
import './Purpurina.css'

const COLORS = ['var(--manifestacion)', 'var(--manifestacion-edge)', '#ffffff', '#ffe066']
const SHAPES = ['square', 'diamond', 'star'] as const
const DURATION_MS = 3200

interface Particle {
  id: number
  left: number
  size: number
  delay: number
  fall: number
  spin: number
  drift: number
  color: string
  shape: (typeof SHAPES)[number]
}

function makeParticles(count: number): Particle[] {
  return Array.from({ length: count }, (_, id) => ({
    id,
    left: Math.random() * 100,
    size: 4 + Math.random() * 5,
    delay: Math.random() * 0.9,
    fall: 1.6 + Math.random() * 0.9,
    spin: (Math.random() < 0.5 ? -1 : 1) * (360 + Math.random() * 540),
    drift: (Math.random() - 0.5) * 60,
    color: COLORS[Math.floor(Math.random() * COLORS.length)]!,
    shape: SHAPES[Math.floor(Math.random() * SHAPES.length)]!,
  }))
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

/** The glitter layer. Mount it and it falls once, then calls onDone and renders nothing. */
export function Purpurina({ count = 70, onDone }: { count?: number; onDone?: () => void }) {
  const [alive, setAlive] = useState(true)
  const particles = useMemo(() => makeParticles(count), [count])
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
    <div className="purpurina" aria-hidden="true">
      {particles.map((p) => (
        <i
          key={p.id}
          className={`purpurina__p purpurina__p--${p.shape}`}
          style={
            {
              left: `${p.left}vw`,
              '--size': `${p.size}px`,
              '--delay': `${p.delay}s`,
              '--fall': `${p.fall}s`,
              '--spin': `${p.spin}deg`,
              '--drift': `${p.drift}px`,
              '--color': p.color,
            } as React.CSSProperties
          }
        />
      ))}
    </div>
  )
}
