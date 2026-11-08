// Billy, the dramatic opossum (decision D17). One mood per phase; see the canvas board "Billy · estados por fase".

import type { Phase } from '../domain/cycle'
import { useState, type MouseEvent, type ReactNode } from 'react'
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
  | 'spa'
  // For the partner: what Billy suggests he does, not how she is.
  | 'mayordomo'
  | 'escucha'
  | 'elegante'
  | 'bandera'

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
  spa: 'Billy en modo spa, con mascarilla, pepinos y una tila',
  mayordomo: 'Billy de mayordomo, con bandeja, manta y algo calentito',
  escucha: 'Billy todo orejas, con libreta y lápiz',
  elegante: 'Billy elegante, con pajarita y una rosa',
  bandera: 'Billy con bandera blanca y un plato de pasta',
}

/** Her avatars: how she is in each phase. The partner's live in Pareja.tsx. */
export function moodFor(phase: Phase, cycleDay: number): BillyMood {
  // The period is a recharge, not a tragedy: Billy meditates, never cries (desolado is for errors).
  if (phase === 'poder1') return cycleDay <= 2 ? 'meditando' : 'pesas'
  if (phase === 'manifestacion') return 'bailando'
  if (phase === 'poder2') return 'spa'
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
      <g className="billy-x" stroke={EYE} strokeWidth="3.2" strokeLinecap="round">
        <path d="M32 68 L40 76" />
        <path d="M40 68 L32 76" />
        <path d="M48 68 L56 76" />
        <path d="M56 68 L48 76" />
      </g>
      {/* One eye that opens on the loading screen, when Billy wakes up. */}
      <g className="billy-eye">
        <circle cx="52" cy="72" r="5.5" fill="#fff" stroke={EYE} strokeWidth="2" />
        <circle cx="52" cy="73" r="2.6" fill={EYE} />
      </g>
      <circle cx="24" cy="86" r="5" fill={NOSE} />
      <ellipse cx="40" cy="96" rx="5.5" ry="8" fill={NOSE} />
    </>
  )
}

/** Ears, face and nose, shared by the poses. Eyes and mouth go in as children. */
function Head({ children, cheeks = true, earR = 13 }: { children: ReactNode; cheeks?: boolean; earR?: number }) {
  return (
    <>
      {[34, 86].map((x) => (
        <g key={x}>
          <circle cx={x} cy="40" r={earR} fill={DARK} />
          <circle cx={x} cy="40" r={earR * 0.46} fill={PINK} />
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

/** Shared by the new poses: tail and feet behind a sitting body. */
function Base({ body = GREY }: { body?: string }) {
  return (
    <>
      <path d="M90 108 C110 112 112 92 100 86" fill="none" stroke={PINK} strokeWidth="7" strokeLinecap="round" />
      <path d="M48 114 L41 127 M72 114 L79 127" stroke={GREY} strokeWidth="8" strokeLinecap="round" />
      <ellipse cx="60" cy="102" rx="28" ry="20" fill={body} />
    </>
  )
}

function Steam({ x, y }: { x: number; y: number }) {
  return (
    <g className="billy-steam" fill="none" stroke="#9AA0A8" strokeWidth="2" strokeLinecap="round" opacity="0.8">
      <path d={`M${x} ${y} q-3 -4 0 -8 q3 -4 0 -8`} />
      <path d={`M${x + 6} ${y + 2} q-3 -4 0 -8 q3 -4 0 -8`} />
    </g>
  )
}

/** Poder 2, for her: hormones on holiday, so a spa day. Robe, towel turban, face mask, cucumbers, tea. */
function Spa() {
  const ROBE = '#F7C3CE'
  return (
    <>
      <path d="M90 108 C110 112 112 92 100 86" fill="none" stroke={PINK} strokeWidth="7" strokeLinecap="round" />
      <ellipse cx="60" cy="102" rx="30" ry="21" fill={ROBE} />
      <path d="M46 84 L60 104 L74 84" fill="none" stroke="#E86A92" strokeWidth="4" strokeLinejoin="round" />
      <path d="M33 106 Q60 113 87 106" fill="none" stroke="#E86A92" strokeWidth="4" strokeLinecap="round" />
      <path d="M36 94 Q30 104 38 112" fill="none" stroke={ROBE} strokeWidth="9" strokeLinecap="round" />
      <circle cx="38" cy="112" r="4.5" fill={PINK} />
      <path d="M84 94 Q94 100 92 104" fill="none" stroke={ROBE} strokeWidth="9" strokeLinecap="round" />
      <Steam x={92} y={90} />
      <rect x="88" y="96" width="16" height="15" rx="3" fill="#fff" stroke="#C9CDD3" strokeWidth="1.5" />
      <path d="M104 100 q6 0 6 4 q0 4 -6 4" fill="none" stroke="#C9CDD3" strokeWidth="2" />
      <path d="M90 100 h12" stroke="#C98A3A" strokeWidth="2.5" />
      <circle cx="90" cy="104" r="4.5" fill={PINK} />
      <Head cheeks={false}>
        <ellipse cx="60" cy="64" rx="26" ry="22" fill="#BFE3A8" />
        {[48, 72].map((x) => (
          <g key={x}>
            <circle cx={x} cy="58" r="8" fill="#7CB342" />
            <circle cx={x} cy="58" r="6" fill="#E4F3D3" />
            <circle cx={x - 2} cy="57" r="0.9" fill="#7CB342" />
            <circle cx={x + 2} cy="57" r="0.9" fill="#7CB342" />
            <circle cx={x} cy="60.5" r="0.9" fill="#7CB342" />
          </g>
        ))}
        <path d="M53 81 q7 5 14 0" fill="none" stroke={EYE} strokeWidth="2.6" strokeLinecap="round" />
      </Head>
      <path d="M27 47 Q30 19 60 19 Q90 19 93 47 Q60 34 27 47 Z" fill="#fff" stroke="#E6E2DC" strokeWidth="1.5" />
      <path d="M50 22 Q60 6 70 22 Z" fill="#fff" stroke="#E6E2DC" strokeWidth="1.5" />
    </>
  )
}

/** Recarga, for him: a useful dead opossum. Tailcoat, moustache, tray with something hot and the ibuprofen, blanket on the arm. */
function Butler() {
  return (
    <>
      <Base body={DARK} />
      <path d="M48 84 Q60 82 72 84 L60 108 Z" fill="#fff" />
      <circle cx="60" cy="96" r="1.6" fill={DARK} />
      <circle cx="60" cy="102" r="1.6" fill={DARK} />
      <path d="M84 92 L101 70" stroke={DARK} strokeWidth="8" strokeLinecap="round" />
      <path d="M36 92 Q28 102 34 112" fill="none" stroke={DARK} strokeWidth="8" strokeLinecap="round" />
      <rect x="22" y="96" width="17" height="20" rx="3" fill="#F28BA0" />
      <path d="M22 102 h17 M22 109 h17 M28 96 v20 M34 96 v20" stroke="#D92C6E" strokeWidth="1.2" opacity="0.6" />
      <Head>
        <path d="M42 59 q6 -4 12 0" fill="none" stroke={EYE} strokeWidth="3.2" strokeLinecap="round" />
        <path d="M66 59 q6 -4 12 0" fill="none" stroke={EYE} strokeWidth="3.2" strokeLinecap="round" />
        <path d="M60 78 q-6 -3 -13 1 M60 78 q6 -3 13 1" fill="none" stroke={DARK} strokeWidth="3" strokeLinecap="round" />
      </Head>
      <path d="M51 86 L60 90 L51 94 Z M69 86 L60 90 L69 94 Z" fill="#D92C6E" />
      <circle cx="60" cy="90" r="2.5" fill="#A3134E" />
      <g className="billy-float">
        <Steam x={95} y={46} />
        <rect x="92" y="48" width="12" height="13" rx="2" fill="#FF8A00" />
        <path d="M104 51 q5 0 5 4 q0 3 -5 3" fill="none" stroke="#FF8A00" strokeWidth="2" />
        <rect x="107" y="56" width="9" height="5" rx="2.5" fill="#fff" stroke="#C9CDD3" />
        <path d="M111.5 56 v5" stroke="#C9CDD3" />
        <ellipse cx="102" cy="63" rx="16" ry="3.5" fill="#C9CDD3" stroke="#9AA0A8" strokeWidth="1.5" />
        <circle cx="102" cy="68" r="4.5" fill={PINK} />
      </g>
    </>
  )
}

/** Poder 1, for him: the window for pending conversations. All ears, notepad and pencil. */
function Listening() {
  return (
    <>
      <Base />
      <path d="M36 92 Q30 100 34 106" fill="none" stroke={GREY} strokeWidth="8" strokeLinecap="round" />
      <rect x="26" y="96" width="26" height="22" rx="2" fill="#fff" stroke="#C9CDD3" strokeWidth="1.5" />
      <path d="M30 96 v-3 M36 96 v-3 M42 96 v-3 M48 96 v-3" stroke="#9AA0A8" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M30 104 h16 M30 109 h12" stroke="#1CB0F6" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="34" cy="106" r="4.5" fill={PINK} />
      <g className="billy-scribble">
        <path d="M84 92 Q80 104 62 108" fill="none" stroke={GREY} strokeWidth="8" strokeLinecap="round" />
        <path d="M54 114 L66 96" stroke="#FFC800" strokeWidth="4" strokeLinecap="round" />
        <path d="M54 114 l-1 3" stroke={DARK} strokeWidth="2" strokeLinecap="round" />
        <circle cx="62" cy="108" r="4.5" fill={PINK} />
      </g>
      <Head earR={19}>
        <path d="M42 47 q6 -4 12 -1 M66 46 q6 -3 12 1" fill="none" stroke={EYE} strokeWidth="2.6" strokeLinecap="round" />
        <circle cx="48" cy="57" r="6.5" fill="#fff" stroke={EYE} strokeWidth="2" />
        <circle cx="72" cy="57" r="6.5" fill="#fff" stroke={EYE} strokeWidth="2" />
        <circle cx="48" cy="58" r="3" fill={EYE} />
        <circle cx="72" cy="58" r="3" fill={EYE} />
        <ellipse cx="60" cy="82" rx="3.5" ry="4" fill={EYE} />
      </Head>
      <g className="billy-twinkle" fill="none" stroke="#1CB0F6" strokeWidth="2.5" strokeLinecap="round">
        <path d="M108 32 q5 7 0 14" />
        <path d="M114 27 q8 12 0 24" />
        <path d="M12 32 q-5 7 0 14" />
        <path d="M6 27 q-8 12 0 24" />
      </g>
    </>
  )
}

/** Manifestación, for him: book the table and lose the tracksuit. Tuxedo, bow tie, rose, wink. */
function Dapper() {
  return (
    <>
      <g className="billy-hearts" fill="#FF4B8B">
        <path d="M104 40 c-4 -4 -9 1 -4 6 l4 4 l4 -4 c5 -5 0 -10 -4 -6 z" />
        <path d="M14 56 c-3 -3 -7 1 -3 4.5 l3 3 l3 -3 c4 -3.5 0 -7.5 -3 -4.5 z" />
      </g>
      <Base body={DARK} />
      <path d="M48 84 Q60 82 72 84 L60 108 Z" fill="#fff" />
      <path d="M36 92 Q24 100 36 108" fill="none" stroke={DARK} strokeWidth="8" strokeLinecap="round" />
      <path d="M84 92 Q96 100 84 108" fill="none" stroke={DARK} strokeWidth="8" strokeLinecap="round" />
      <Head>
        <path d="M42 58 q6 -4 12 0" fill="none" stroke={EYE} strokeWidth="3.2" strokeLinecap="round" />
        <path d="M66 46 q6 -4 12 0" fill="none" stroke={EYE} strokeWidth="2.6" strokeLinecap="round" />
        <circle cx="72" cy="57" r="5.5" fill={EYE} />
        <circle cx="73.8" cy="55.2" r="1.8" fill="#fff" />
        <path d="M51 81 q6 4 12 0" fill="none" stroke={EYE} strokeWidth="2.6" strokeLinecap="round" />
      </Head>
      <path d="M62 82 L86 76" stroke="#3B8F2B" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M72 79 q4 -6 8 -3 q-4 4 -8 3 z" fill="#3B8F2B" />
      <circle cx="90" cy="75" r="7" fill="#E53935" />
      <path d="M87 74 q3 -4 6 0 q-3 3 -5 1" fill="none" stroke="#A3134E" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M51 86 L60 90 L51 94 Z M69 86 L60 90 L69 94 Z" fill="#E53935" />
      <circle cx="60" cy="90" r="2.5" fill="#A31C1C" />
    </>
  )
}

/** Mimos, for him: diplomacy. White flag up, a peace offering of pasta. */
function WhiteFlag() {
  return (
    <>
      <Base />
      <path d="M101 112 V6" stroke="#8B5A2B" strokeWidth="3" strokeLinecap="round" />
      <path className="billy-flag" d="M102 7 q8 -4 16 0 v18 q-8 -4 -16 0 z" fill="#fff" stroke="#C9CDD3" strokeWidth="1.5" />
      <path d="M84 92 L99 74" stroke={GREY} strokeWidth="8" strokeLinecap="round" />
      <circle cx="100" cy="72" r="5" fill={PINK} />
      <path d="M36 92 Q28 100 30 106" fill="none" stroke={GREY} strokeWidth="8" strokeLinecap="round" />
      <path d="M24 104 q14 -16 28 0 z" fill="#FFD45C" />
      <path d="M28 102 q4 -5 8 0 q4 -5 8 0 M32 97 q4 -4 8 0" fill="none" stroke="#E5B53A" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="40" cy="96" r="3.5" fill="#E53935" />
      <ellipse cx="38" cy="106" rx="19" ry="5" fill="#fff" stroke="#C9CDD3" strokeWidth="1.5" />
      <circle cx="30" cy="108" r="4.5" fill={PINK} />
      <g className="billy-steam" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round">
        <path d="M34 90 q-3 -4 0 -8" />
        <path d="M42 88 q-3 -4 0 -8" />
      </g>
      <Head>
        <path d="M43 50 l9 -3 M77 50 l-9 -3" stroke={EYE} strokeWidth="2.6" strokeLinecap="round" />
        <path d="M42 59 q6 -5 12 0" fill="none" stroke={EYE} strokeWidth="3.2" strokeLinecap="round" />
        <path d="M66 59 q6 -5 12 0" fill="none" stroke={EYE} strokeWidth="3.2" strokeLinecap="round" />
        <path d="M50 79 q10 9 20 0 z" fill="#fff" stroke={EYE} strokeWidth="2.2" strokeLinejoin="round" />
      </Head>
      <path className="billy-sweat" d="M92 46 q-4 7 0 10 q4 -3 0 -10 z" fill="#1CB0F6" />
    </>
  )
}

const POSES = {
  meditando: Meditating,
  pesas: Lifting,
  bailando: Dancing,
  artificiero: BombSquad,
  spa: Spa,
  mayordomo: Butler,
  escucha: Listening,
  elegante: Dapper,
  bandera: WhiteFlag,
} as const

function BillyBody({ mood }: { mood: Exclude<BillyMood, 'muerto'> }) {
  if (mood in POSES) {
    const Pose = POSES[mood as keyof typeof POSES]
    return <Pose />
  }
  return <Sitting mood={mood as 'normal' | 'fiesta' | 'alerta' | 'desolado'} />
}

/** What Billy does when she pokes him: a short gesture per mood, nothing more (propuesta 4.5). */
const GESTURES: Record<BillyMood, string> = {
  normal: 'squash',
  fiesta: 'squash',
  alerta: 'squash',
  desolado: 'squash',
  muerto: 'twitch',
  meditando: 'pulse',
  pesas: 'bounce',
  bailando: 'spin',
  artificiero: 'twitch',
  spa: 'wiggle',
  mayordomo: 'squash',
  escucha: 'wiggle',
  elegante: 'squash',
  bandera: 'wiggle',
}

export function Billy({ mood, size = 120, waking = false }: { mood: BillyMood; size?: number; waking?: boolean }) {
  const dead = mood === 'muerto'
  const [gesture, setGesture] = useState<string | null>(null)

  function poke(e: MouseEvent) {
    // A poke is a wink, not a tap on whatever Billy sits in (the hero link).
    e.preventDefault()
    e.stopPropagation()
    if (gesture) return
    navigator.vibrate?.(10)
    setGesture(GESTURES[mood])
    window.setTimeout(() => setGesture(null), 700)
  }

  return (
    <svg
      width={dead ? size * 1.3 : size}
      height={dead ? size * 0.84 : size * 1.08}
      viewBox={dead ? '0 0 170 110' : '0 0 120 130'}
      role="img"
      aria-label={LABELS[mood]}
      className={['billy', gesture && `billy--${gesture}`, waking && 'billy--waking'].filter(Boolean).join(' ')}
      onClick={poke}
    >
      {dead ? <PlayingDead /> : <BillyBody mood={mood} />}
    </svg>
  )
}
