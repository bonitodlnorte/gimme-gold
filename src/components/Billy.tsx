// Billy, the dramatic opossum (decision D17). One mood per phase; see the canvas board "Billy · estados por fase".

import type { Phase } from '../domain/cycle'

export type BillyMood = 'normal' | 'fiesta' | 'alerta' | 'desolado' | 'muerto'

const LABELS: Record<BillyMood, string> = {
  normal: 'Billy',
  fiesta: 'Billy, de fiesta',
  alerta: 'Billy, en alerta',
  desolado: 'Billy, desolado',
  muerto: 'Billy, haciéndose el muerto',
}

export function moodFor(phase: Phase, cycleDay: number): BillyMood {
  if (phase === 'poder1') return cycleDay <= 2 ? 'desolado' : 'normal'
  if (phase === 'manifestacion') return 'fiesta'
  if (phase === 'poder2') return 'alerta'
  return 'muerto'
}

const GREY = '#9AA0A8'
const FACE = '#F4F1EC'
const DARK = '#2B2B2B'
const PINK = '#F2A7B5'
const NOSE = '#F28BA0'
const EYE = '#1A1A1A'

function Sitting({ mood }: { mood: Exclude<BillyMood, 'muerto'> }) {
  const earY = mood === 'desolado' ? 46 : mood === 'alerta' ? 36 : 40
  const earX = mood === 'desolado' ? [30, 90] : [34, 86]
  return (
    <>
      <path d="M90 104 C114 108 116 82 104 76" fill="none" stroke={PINK} strokeWidth="7" strokeLinecap="round" />
      <ellipse cx="60" cy="98" rx="32" ry="26" fill={GREY} />
      {mood === 'fiesta' && (
        <>
          <path d="M30 92 L10 70" stroke={GREY} strokeWidth="9" strokeLinecap="round" />
          <path d="M90 92 L110 70" stroke={GREY} strokeWidth="9" strokeLinecap="round" />
        </>
      )}
      {earX.map((x) => (
        <g key={x}>
          <circle cx={x} cy={earY} r="13" fill={DARK} />
          <circle cx={x} cy={earY} r="6" fill={PINK} />
        </g>
      ))}
      <ellipse cx="60" cy={mood === 'desolado' ? 64 : 62} rx="30" ry="27" fill={FACE} />

      {mood === 'normal' && (
        <>
          <circle cx="48" cy="57" r="5.5" fill={EYE} />
          <circle cx="72" cy="57" r="5.5" fill={EYE} />
          <circle cx="49.8" cy="55.2" r="1.8" fill="#fff" />
          <circle cx="73.8" cy="55.2" r="1.8" fill="#fff" />
          <path d="M53 80 q7 6 14 0" fill="none" stroke={EYE} strokeWidth="2.6" strokeLinecap="round" />
        </>
      )}
      {mood === 'fiesta' && (
        <>
          <path d="M42 57 q6 -6 12 0" fill="none" stroke={EYE} strokeWidth="3.5" strokeLinecap="round" />
          <path d="M66 57 q6 -6 12 0" fill="none" stroke={EYE} strokeWidth="3.5" strokeLinecap="round" />
          <path d="M50 78 q10 12 20 0 z" fill={EYE} />
          <polygon points="60,6 48,36 72,36" fill="#7B3FE4" />
          <circle cx="60" cy="6" r="5" fill="#FF4B8B" />
        </>
      )}
      {mood === 'alerta' && (
        <>
          <circle cx="48" cy="56" r="8" fill="#fff" stroke={EYE} strokeWidth="2.5" />
          <circle cx="72" cy="56" r="8" fill="#fff" stroke={EYE} strokeWidth="2.5" />
          <circle cx="48" cy="57" r="3" fill={EYE} />
          <circle cx="72" cy="57" r="3" fill={EYE} />
          <path d="M52 82 h16" stroke={EYE} strokeWidth="2.6" strokeLinecap="round" />
          <path d="M92 44 q5 8 0 12 q-5 -4 0 -12 z" fill="#1CB0F6" />
        </>
      )}
      {mood === 'desolado' && (
        <>
          <path d="M42 56 q6 5 12 0" fill="none" stroke={EYE} strokeWidth="3.5" strokeLinecap="round" />
          <path d="M66 56 q6 5 12 0" fill="none" stroke={EYE} strokeWidth="3.5" strokeLinecap="round" />
          <path d="M46 62 q-3 8 0 12 q3 -4 0 -12 z" fill="#1CB0F6" />
          <path d="M74 62 q-3 8 0 12 q3 -4 0 -12 z" fill="#1CB0F6" />
          <path d="M52 86 q8 -6 16 0" fill="none" stroke={EYE} strokeWidth="2.6" strokeLinecap="round" />
        </>
      )}
      {(mood === 'normal' || mood === 'fiesta') && (
        <>
          <circle cx="40" cy="70" r="4.5" fill="#F7C3CE" />
          <circle cx="80" cy="70" r="4.5" fill="#F7C3CE" />
        </>
      )}
      <circle cx="60" cy={mood === 'desolado' ? 74 : mood === 'fiesta' ? 71 : 72} r="5.5" fill={NOSE} />
    </>
  )
}

function PlayingDead() {
  return (
    <>
      <path d="M132 80 C152 76 160 92 146 98" fill="none" stroke={PINK} strokeWidth="6" strokeLinecap="round" />
      <g stroke={GREY} strokeWidth="9" strokeLinecap="round">
        <path d="M70 62 L62 34" />
        <path d="M88 58 L86 28" />
        <path d="M106 58 L110 28" />
        <path d="M122 64 L132 38" />
      </g>
      <g fill={PINK}>
        <circle cx="62" cy="32" r="5" />
        <circle cx="86" cy="26" r="5" />
        <circle cx="110" cy="26" r="5" />
        <circle cx="132" cy="36" r="5" />
      </g>
      <ellipse cx="96" cy="78" rx="44" ry="24" fill={GREY} />
      <circle cx="30" cy="58" r="11" fill={DARK} />
      <circle cx="30" cy="58" r="5" fill={PINK} />
      <ellipse cx="44" cy="78" rx="27" ry="23" fill={FACE} />
      <g stroke={EYE} strokeWidth="3.2" strokeLinecap="round">
        <path d="M32 68 L40 76" />
        <path d="M40 68 L32 76" />
        <path d="M48 68 L56 76" />
        <path d="M56 68 L48 76" />
      </g>
      <circle cx="24" cy="86" r="5" fill={NOSE} />
      <ellipse cx="40" cy="96" rx="5.5" ry="8" fill={NOSE} />
    </>
  )
}

export function Billy({ mood, size = 120 }: { mood: BillyMood; size?: number }) {
  const dead = mood === 'muerto'
  return (
    <svg
      width={dead ? size * 1.3 : size}
      height={dead ? size * 0.84 : size * 1.08}
      viewBox={dead ? '0 0 170 110' : '0 0 120 130'}
      role="img"
      aria-label={LABELS[mood]}
    >
      {dead ? <PlayingDead /> : <Sitting mood={mood} />}
    </svg>
  )
}
