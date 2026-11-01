// Billy, the dramatic opossum (decision D17). One mood per phase; see the canvas board "Billy · estados por fase".

import type { Phase } from '../domain/cycle'
import type { ReactNode } from 'react'
import './Billy.css'

export type BillyMood =
  | 'normal'
  | 'fiesta'
  | 'alerta'
  | 'desolado'
  | 'muerto'
  // One per phase (Hoy, pareja, Aprender). Animated, unless she asked for reduced motion.
  | 'meditando'
  | 'pesas'
  | 'bailando'
  | 'artificiero'

const LABELS: Record<BillyMood, string> = {
  normal: 'Billy',
  fiesta: 'Billy, de fiesta',
  alerta: 'Billy, en alerta',
  desolado: 'Billy, desolado',
  muerto: 'Billy, haciéndose el muerto',
  meditando: 'Billy, meditando en modo recarga',
  pesas: 'Billy, levantando pesas',
  bailando: 'Billy, bailando en la tarima',
  artificiero: 'Billy, de artificiero, con muchísimo cuidado',
}

export function moodFor(phase: Phase, cycleDay: number): BillyMood {
  // The period is a recharge, not a tragedy: Billy meditates, never cries (desolado is for errors).
  if (phase === 'poder1') return cycleDay <= 2 ? 'meditando' : 'pesas'
  if (phase === 'manifestacion') return 'bailando'
  if (phase === 'poder2') return 'artificiero'
  return 'muerto'
}

const GREY = '#9AA0A8'
const FACE = '#F4F1EC'
const DARK = '#2B2B2B'
const PINK = '#F2A7B5'
const NOSE = '#F28BA0'
const EYE = '#1A1A1A'

function Sitting({ mood }: { mood: 'normal' | 'fiesta' | 'alerta' | 'desolado' }) {
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

/** Ears, face and nose, shared by the poses. Eyes and mouth go in as children. */
function Head({ children, cheeks = true }: { children: ReactNode; cheeks?: boolean }) {
  return (
    <>
      {[34, 86].map((x) => (
        <g key={x}>
          <circle cx={x} cy="40" r="13" fill={DARK} />
          <circle cx={x} cy="40" r="6" fill={PINK} />
        </g>
      ))}
      <ellipse cx="60" cy="62" rx="30" ry="27" fill={FACE} />
      {children}
      {cheeks && (
        <>
          <circle cx="40" cy="70" r="4.5" fill="#F7C3CE" />
          <circle cx="80" cy="70" r="4.5" fill="#F7C3CE" />
        </>
      )}
      <circle cx="60" cy="72" r="5.5" fill={NOSE} />
    </>
  )
}

/** Recarga: cross-legged, eyes closed, floating in a golden aura. */
function Meditating() {
  return (
    <>
      <circle className="billy-aura" cx="60" cy="62" r="42" fill="none" stroke="#FFC800" strokeWidth="3" />
      <g className="billy-twinkle" fill="#FFC800">
        <circle cx="16" cy="34" r="2.5" />
        <circle cx="104" cy="28" r="3" />
        <circle cx="108" cy="80" r="2" />
      </g>
      <g className="billy-float">
        <path d="M88 116 C108 120 112 100 100 96" fill="none" stroke={PINK} strokeWidth="7" strokeLinecap="round" />
        <ellipse cx="60" cy="117" rx="38" ry="10" fill="#868C94" />
        <ellipse cx="60" cy="100" rx="28" ry="22" fill={GREY} />
        <path d="M37 94 Q27 106 34 114" fill="none" stroke={GREY} strokeWidth="8" strokeLinecap="round" />
        <path d="M83 94 Q93 106 86 114" fill="none" stroke={GREY} strokeWidth="8" strokeLinecap="round" />
        <circle cx="34" cy="114" r="4.5" fill={PINK} />
        <circle cx="86" cy="114" r="4.5" fill={PINK} />
        <Head>
          <path d="M42 58 q6 3.5 12 0" fill="none" stroke={EYE} strokeWidth="3.2" strokeLinecap="round" />
          <path d="M66 58 q6 3.5 12 0" fill="none" stroke={EYE} strokeWidth="3.2" strokeLinecap="round" />
          <path d="M55 81 q5 4 10 0" fill="none" stroke={EYE} strokeWidth="2.6" strokeLinecap="round" />
        </Head>
      </g>
    </>
  )
}

/** Poder 1: the energy is back. Pressing a barbell overhead, sweatband on, teeth gritted. */
function Lifting() {
  return (
    <>
      <path d="M90 108 C110 112 112 92 100 86" fill="none" stroke={PINK} strokeWidth="7" strokeLinecap="round" />
      <path d="M48 114 L41 127 M72 114 L79 127" stroke={GREY} strokeWidth="8" strokeLinecap="round" />
      <ellipse cx="60" cy="102" rx="28" ry="20" fill={GREY} />
      <g className="billy-lift">
        <path d="M38 94 L27 24 M82 94 L93 24" stroke={GREY} strokeWidth="8" strokeLinecap="round" />
        <path d="M4 20 H116" stroke={DARK} strokeWidth="4" strokeLinecap="round" />
        <rect x="8" y="6" width="9" height="28" rx="3" fill="#6B2FD6" />
        <rect x="18" y="10" width="5" height="20" rx="2" fill="#4E1FA3" />
        <rect x="103" y="6" width="9" height="28" rx="3" fill="#6B2FD6" />
        <rect x="97" y="10" width="5" height="20" rx="2" fill="#4E1FA3" />
        <circle cx="27" cy="21" r="5" fill={PINK} />
        <circle cx="93" cy="21" r="5" fill={PINK} />
      </g>
      <Head>
        <path d="M31 50 Q60 40 89 50 L88 57 Q60 47 32 57 Z" fill="#D92C6E" />
        <path d="M43 61 l9 2.5 -9 2.5 M77 61 l-9 2.5 9 2.5" fill="none" stroke={EYE} strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" />
        <rect x="51" y="79" width="18" height="7" rx="2" fill="#fff" stroke={EYE} strokeWidth="2" />
        <path d="M57 79 v7 M63 79 v7" stroke={EYE} strokeWidth="1.5" />
      </Head>
      <path className="billy-sweat" d="M94 46 q-4 7 0 10 q4 -3 0 -10 z" fill="#1CB0F6" />
    </>
  )
}

/** Manifestación: on fire, dancing on the stage under a disco ball. */
function Dancing() {
  return (
    <>
      <path d="M100 0 V9" stroke="#9AA0A8" strokeWidth="1.5" />
      <circle cx="100" cy="18" r="9" fill="#D9DDE3" stroke="#9AA0A8" strokeWidth="1.5" />
      <path d="M91 18 h18 M100 9 v18 M93 12 q7 6 14 0 M93 24 q7 -6 14 0" stroke="#9AA0A8" strokeWidth="1" fill="none" />
      <g className="billy-twinkle" fill="#FFC800">
        <circle cx="84" cy="10" r="2" />
        <circle cx="112" cy="34" r="2.5" />
        <circle cx="14" cy="22" r="2.5" />
      </g>
      <g className="billy-dance">
        <path d="M88 104 C108 108 110 86 98 80" fill="none" stroke={PINK} strokeWidth="7" strokeLinecap="round" />
        <path d="M50 110 L44 119 M70 110 L78 119" stroke={GREY} strokeWidth="8" strokeLinecap="round" />
        <ellipse cx="60" cy="96" rx="28" ry="21" fill={GREY} />
        <path d="M36 90 Q22 98 36 106" fill="none" stroke={GREY} strokeWidth="8" strokeLinecap="round" />
        <path d="M84 88 L101 60" stroke={GREY} strokeWidth="9" strokeLinecap="round" />
        <circle cx="102" cy="58" r="5.5" fill={PINK} />
        <Head>
          <rect x="38" y="52" width="19" height="11" rx="4" fill={DARK} />
          <rect x="63" y="52" width="19" height="11" rx="4" fill={DARK} />
          <path d="M57 56 h6" stroke={DARK} strokeWidth="2.5" />
          <path d="M42 55 l5 0 M67 55 l5 0" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" opacity="0.7" />
          <path d="M49 77 q11 13 22 0 z" fill={EYE} />
        </Head>
      </g>
      <rect x="6" y="119" width="108" height="11" rx="3" fill="#3C3C3C" />
      {[16, 104].map((x) => (
        <g key={x} className="billy-flame">
          <path d={`M${x} 119 q-7 -10 0 -20 q2 8 7 6 q1 8 -7 14 z`} fill="#FF8A00" />
          <path d={`M${x + 1} 119 q-4 -6 0 -11 q2 5 3 4 q0 5 -3 7 z`} fill="#FFC800" />
        </g>
      ))}
    </>
  )
}

/** Poder 2: proceed with extreme caution. Bomb-disposal suit, visor, pliers, lit fuse. */
function BombSquad() {
  const OLIVE = '#5B6B3A'
  return (
    <g className="billy-tremble">
      <path d="M28 116 C10 118 8 100 18 96" fill="none" stroke={PINK} strokeWidth="7" strokeLinecap="round" />
      <ellipse cx="58" cy="104" rx="36" ry="25" fill={OLIVE} />
      <rect x="38" y="92" width="40" height="24" rx="7" fill="#4A5830" />
      <path d="M42 100 h32 M42 108 h32" stroke={OLIVE} strokeWidth="2" />
      <path d="M32 98 Q22 108 32 117" fill="none" stroke={OLIVE} strokeWidth="10" strokeLinecap="round" />
      <circle cx="60" cy="58" r="38" fill={OLIVE} />
      <ellipse cx="60" cy="64" rx="25" ry="21" fill={FACE} />
      <path d="M43 52 l9 -4 M77 52 l-9 -4" stroke={EYE} strokeWidth="2.6" strokeLinecap="round" />
      <circle cx="48" cy="60" r="7" fill="#fff" stroke={EYE} strokeWidth="2" />
      <circle cx="72" cy="60" r="7" fill="#fff" stroke={EYE} strokeWidth="2" />
      <circle cx="49.5" cy="62.5" r="2.6" fill={EYE} />
      <circle cx="73.5" cy="62.5" r="2.6" fill={EYE} />
      <circle cx="60" cy="72" r="4.5" fill={NOSE} />
      <path d="M51 80 q2.25 -2 4.5 0 q2.25 2 4.5 0 q2.25 -2 4.5 0 q2.25 2 4.5 0" fill="none" stroke={EYE} strokeWidth="2.2" strokeLinecap="round" />
      <ellipse cx="60" cy="64" rx="27" ry="23" fill="#9FD8F2" opacity="0.3" stroke="#3B4A26" strokeWidth="3.5" />
      <path d="M42 52 q8 -9 19 -9" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" opacity="0.7" />
      <path className="billy-sweat" d="M92 40 q-4 7 0 10 q4 -3 0 -10 z" fill="#1CB0F6" />
      <circle cx="98" cy="118" r="11" fill={DARK} />
      <circle cx="94" cy="114" r="2.5" fill="#fff" opacity="0.4" />
      <path d="M104 109 q4 -6 9 -6" fill="none" stroke="#8B5A2B" strokeWidth="2.5" strokeLinecap="round" />
      <g className="billy-spark">
        <circle cx="114" cy="102" r="4" fill="#FFC800" />
        <circle cx="114" cy="102" r="2" fill="#FF4B8B" />
      </g>
      <path d="M84 98 Q92 104 90 112" fill="none" stroke={OLIVE} strokeWidth="9" strokeLinecap="round" />
      <circle cx="90" cy="112" r="4.5" fill={PINK} />
      <path d="M92 110 L100 104 M93 114 L102 108" stroke="#E53935" strokeWidth="3" strokeLinecap="round" />
    </g>
  )
}

const POSES = { meditando: Meditating, pesas: Lifting, bailando: Dancing, artificiero: BombSquad } as const

function BillyBody({ mood }: { mood: Exclude<BillyMood, 'muerto'> }) {
  if (mood in POSES) {
    const Pose = POSES[mood as keyof typeof POSES]
    return <Pose />
  }
  return <Sitting mood={mood as 'normal' | 'fiesta' | 'alerta' | 'desolado'} />
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
      className="billy"
    >
      {dead ? <PlayingDead /> : <BillyBody mood={mood} />}
    </svg>
  )
}
