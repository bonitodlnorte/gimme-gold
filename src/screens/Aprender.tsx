import { Link, Navigate, useParams } from 'react-router-dom'
import { Billy, type BillyMood } from '../components/Billy'
import { TabBar } from '../components/TabBar'
import { FICHA_ANTICONCEPTIVOS, FICHA_FERTIL, FICHAS_FASE, FUENTE, type FichaExtra } from '../content/aprender'
import { PHASE_NAMES, phaseRanges, type Phase } from '../domain/cycle'
import './Ciclo.css'
import './Historial.css'
import './Aprender.css'

// G-Aprender: the four phases with her own days, plus fertility and contraception sheets.

const PHASES: Phase[] = ['poder1', 'manifestacion', 'poder2', 'mimos']
const MOODS: Record<Phase, BillyMood> = { poder1: 'pesas', manifestacion: 'bailando', poder2: 'artificiero', mimos: 'muerto' }
const EXTRAS: Record<string, FichaExtra> = { 'ventana-fertil': FICHA_FERTIL, anticonceptivos: FICHA_ANTICONCEPTIVOS }

interface Props {
  /** Her estimated cycle length, to show each phase with her own days. */
  cycleLength: number
  currentPhase: Phase
}

function Chevron() {
  return (
    <svg className="aprender__chevron" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M9 6l6 6-6 6" />
    </svg>
  )
}

function BackHeader({ title }: { title: string }) {
  return (
    <header className="historial__head">
      <Link to="/aprender" className="historial__back" aria-label="Volver a Aprender">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M15 18l-6-6 6-6" />
        </svg>
      </Link>
      <h1>{title}</h1>
    </header>
  )
}

export function AprenderScreen({ cycleLength, currentPhase }: Props) {
  const ranges = phaseRanges(cycleLength)
  return (
    <main className="screen aprender">
      <header>
        <h1 className="aprender__title">Aprender</h1>
        <p className="aprender__lead">
          Tus cuatro fases según la Dra. Mindy Pelz, con los días de tu ciclo de {cycleLength} días. Toca una para ver qué pasa con
          tus hormonas y qué te conviene.
        </p>
      </header>

      <ol className="aprender__list">
        {PHASES.map((phase, i) => (
          <li key={phase}>
            <Link to={`/aprender/${phase}`} className="aprender__item" data-phase={phase}>
              <span className="aprender__num">{i + 1}</span>
              <span className="aprender__text">
                <span className="aprender__name">
                  {PHASE_NAMES[phase]}
                  {phase === currentPhase && <span className="aprender__here">Estás aquí</span>}
                </span>
                <span className="aprender__days">
                  Días {ranges[phase].from}–{ranges[phase].to}
                </span>
                <span className="aprender__summary">{FICHAS_FASE[phase].resumen}</span>
              </span>
              <Chevron />
            </Link>
          </li>
        ))}
      </ol>

      <h2 className="eyebrow">Además</h2>
      <ul className="aprender__list">
        {Object.entries(EXTRAS).map(([slug, ficha]) => (
          <li key={slug}>
            <Link to={`/aprender/${slug}`} className="aprender__item">
              <span className="aprender__text">
                <span className="aprender__name">{ficha.titulo}</span>
                <span className="aprender__summary">{ficha.resumen}</span>
              </span>
              <Chevron />
            </Link>
          </li>
        ))}
        <li>
          <a href={FUENTE.url} target="_blank" rel="noreferrer" className="aprender__item">
            <svg className="aprender__play" width="28" height="28" viewBox="0 0 24 24" aria-hidden="true">
              <circle cx="12" cy="12" r="11" fill="currentColor" />
              <path d="M10 8l6 4-6 4z" fill="#fff" />
            </svg>
            <span className="aprender__text">
              <span className="aprender__name">{FUENTE.titulo}</span>
              <span className="aprender__summary">{FUENTE.detalle}. Se abre en YouTube.</span>
            </span>
          </a>
        </li>
      </ul>

      <TabBar />
    </main>
  )
}

export function FichaScreen({ cycleLength, currentPhase }: Props) {
  const { tema = '' } = useParams()

  const extra = EXTRAS[tema]
  if (extra) {
    return (
      <main className="screen aprender">
        <BackHeader title={extra.titulo} />
        {extra.parrafos.map((p) => (
          <p key={p} className="aprender__p">
            {p}
          </p>
        ))}
      </main>
    )
  }

  if (!(PHASES as string[]).includes(tema)) return <Navigate to="/aprender" replace />
  const phase = tema as Phase
  const ficha = FICHAS_FASE[phase]
  const range = phaseRanges(cycleLength)[phase]

  return (
    <main className="screen aprender ciclo" data-phase={phase}>
      <BackHeader title={PHASE_NAMES[phase]} />

      <section className="ciclo__hero">
        <div className="ciclo__hero-text">
          <span className="ciclo__phase">
            Días {range.from}–{range.to}
            {phase === currentPhase ? ' · Estás aquí' : ''}
          </span>
          <p className="ciclo__headline">{ficha.resumen}</p>
        </div>
        <Billy mood={MOODS[phase]} size={88} />
      </section>

      <section className="aprender__block">
        <h2 className="eyebrow">Tus hormonas</h2>
        <p className="aprender__p">{ficha.hormonas}</p>
      </section>

      <section className="aprender__block">
        <h2 className="eyebrow">Cómo te puedes sentir</h2>
        <p className="aprender__p">{ficha.teSientes}</p>
      </section>

      <section className="aprender__block">
        <h2 className="eyebrow">Te conviene</h2>
        <dl className="aprender__tips">
          {ficha.teConviene.map((t) => (
            <div key={t.tema}>
              <dt>{t.tema}</dt>
              <dd>{t.texto}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="aprender__block">
        <h2 className="eyebrow">Y tu pareja</h2>
        <p className="aprender__p">{ficha.pareja}</p>
      </section>

      <section className="ciclo__note ciclo__note--info aprender__ojo">
        <h2>Ojo</h2>
        <ul>
          {ficha.ojo.map((o) => (
            <li key={o}>{o}</li>
          ))}
        </ul>
      </section>
    </main>
  )
}
