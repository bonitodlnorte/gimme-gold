import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Billy, moodFor } from '../components/Billy'
import { Instalar } from '../components/Instalar'
import { Mudanza } from '../components/Mudanza'
import { Purpurina, celebrateOnce, celebrateToday, useThemeColor } from '../components/Purpurina'
import { PHASE_HEX } from './Plan'
import { AVISO_ORIENTATIVO, DATO_FERTIL, PARA_ELLA } from '../content/fases'
import { PHASE_NAMES, type Contraception, type CycleStatus, type Period } from '../domain/cycle'
import { daysBetween, toJsDate } from '../domain/dates'
import { forecast, upcomingChanges } from '../domain/plan'
import { TabBar } from '../components/TabBar'
import type { BackTo } from './Aprender'
import { PeriodSheet } from './PeriodSheet'
import './Ciclo.css'

const FROM_HOY: BackTo = { back: '/', backLabel: 'Hoy' }

const dateLabel = new Intl.DateTimeFormat('es-ES', { weekday: 'long', day: 'numeric', month: 'short' })
const shortDate = new Intl.DateTimeFormat('es-ES', { weekday: 'short', day: 'numeric', month: 'short' })

function nextPeriodText(status: CycleStatus): string {
  const { expected, earliest, latest } = status.nextPeriod
  if (status.daysLate > 0) return `La regla se está retrasando: ${status.daysLate} ${status.daysLate === 1 ? 'día' : 'días'}.`
  const inDays = daysBetween(status.date, expected)
  const min = Math.max(0, daysBetween(status.date, earliest))
  const max = daysBetween(status.date, latest)
  return `Regla prevista en unos ${inDays} días (entre ${min} y ${max}).`
}

interface Props {
  status: CycleStatus
  contraception: Contraception
  periods: Period[]
  onPeriodStarted: (period: Period) => Promise<void>
  onPeriodEnded: () => Promise<void>
}

export function CicloScreen({ status, contraception, periods, onPeriodStarted, onPeriodEnded }: Props) {
  const [registering, setRegistering] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState(false)
  const phase = status.phase
  const onPeriod = phase === 'poder1' && status.periodOngoing
  // Alerta de purpurina: once a day while she is in Manifestación.
  const [glitter, setGlitter] = useState(() => phase === 'manifestacion' && celebrateToday('purpurina'))
  // Each phase has its own welcome the first time she opens the app in it (propuesta 4.2).
  const [welcome, setWelcome] = useState<string | null>(() => {
    const moment = onPeriod ? 'recarga' : phase
    return celebrateOnce('fase', `${status.cycleStart}/${moment}`) ? moment : null
  })
  // Just logged a new period: the hero sweeps to blue and a line says so for a moment (propuesta 4.4).
  const [fresh, setFresh] = useState(false)
  useThemeColor(PHASE_HEX[phase])

  async function run(action: () => Promise<void>) {
    setBusy(true)
    setError(false)
    try {
      await action()
    } catch {
      setError(true)
    } finally {
      setBusy(false)
    }
  }
  const copy = PARA_ELLA[onPeriod ? 'regla' : phase]
  // Same name as the Plan calendar: period days are Recarga, not Poder 1.
  const phaseName = onPeriod ? 'Recarga' : PHASE_NAMES[phase]
  const changes = upcomingChanges(forecast(status, periods, 60), 3)

  return (
    <main className={`screen ciclo${welcome ? ` is-welcome-${welcome}` : ''}`} data-phase={phase} onAnimationEnd={(e) => e.target === e.currentTarget && setWelcome(null)}>
      {glitter && <Purpurina onDone={() => setGlitter(false)} />}
      {welcome === 'recarga' && <div className="ciclo__velo" aria-hidden="true" />}
      <header className="ciclo__top">
        <div className="ciclo__date">
          <p className="eyebrow">{dateLabel.format(toJsDate(status.date))}</p>
          <h1>
            Día {status.cycleDay} de {status.estimate.length}
          </h1>
        </div>
        <Link to="/compartir" className="ciclo__share">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <circle cx="9" cy="8" r="3.5" />
            <path d="M2.5 20c.8-3.6 3.4-5.5 6.5-5.5s5.7 1.9 6.5 5.5" />
            <path d="M16 4.5a3.5 3.5 0 0 1 0 7M18.5 14.8c1.6.8 2.6 2.5 3 5.2" />
          </svg>
          Pareja
        </Link>
        <Link to="/ajustes" className="ciclo__share ciclo__settings" aria-label="Ajustes">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <circle cx="12" cy="12" r="3" />
            <path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z" />
          </svg>
        </Link>
      </header>

      <Mudanza signedIn />

      {/* Two columns on wide screens: how she is today, then what's next. */}
      <div className="ciclo__body">
        <div className="ciclo__col">
          {/* The recharge has no card of its own in Aprender: it is the start of Poder 1. */}
          <Link to={`/aprender/${phase}`} state={FROM_HOY} className={`ciclo__hero${glitter ? ' is-celebrating' : ''}${fresh ? ' is-fresh' : ''}`} aria-label={`${phaseName}: ${copy.headline}. Por qué te sientes así`}>
            <div className="ciclo__hero-text">
              <span className="ciclo__phase">{phaseName}</span>
              <p className="ciclo__headline">{copy.headline}</p>
              <span className="ciclo__why">Por qué te sientes así →</span>
            </div>
            <Billy mood={onPeriod ? 'meditando' : moodFor(phase, status.cycleDay)} size={96} />
            {welcome === 'recarga' && (
              <span className="ciclo__zzz" aria-hidden="true">
                <i>z</i>
                <i>z</i>
                <i>z</i>
              </span>
            )}
            {welcome === 'mimos' && (
              <span className="ciclo__hearts" aria-hidden="true">
                <i>♥</i>
                <i>♥</i>
                <i>♥</i>
              </span>
            )}
          </Link>
          {fresh && (
            <p className="ciclo__fresh" role="status">
              Apuntado. Ciclo nuevo, cuenta a cero.
            </p>
          )}

          <p className="ciclo__billy">
            <span>Billy</span>
            {copy.billy}
          </p>

          {status.fertile && (
            <p className="ciclo__note ciclo__note--info">
              <strong>Dato serio:</strong> {DATO_FERTIL}
            </p>
          )}
          {status.showWarning && (
            <p className="ciclo__note ciclo__note--warn">
              {contraception === 'si' ? AVISO_ORIENTATIVO.anticonceptivos : AVISO_ORIENTATIVO.irregular}
            </p>
          )}
        </div>

        <div className="ciclo__col ciclo__col--side">
          <section>
            <h2 className="eyebrow">Hoy te viene bien</h2>
            <ul className="ciclo__chips">
              {copy.goodFor.map((item) => (
                <li key={item} className="chip">
                  {item}
                </li>
              ))}
            </ul>
          </section>

          <section>
            <div className="ciclo__days-head">
              <h2 className="eyebrow">Lo que viene</h2>
              <Link to="/plan">Ver calendario</Link>
            </div>
            <ol className="ciclo__next">
              {changes.map((c) => (
                <li key={c.date} data-phase={c.state === 'recarga' ? 'poder1' : c.state}>
                  <Link
                    to={`/aprender/${c.state === 'recarga' ? 'poder1' : c.state}`}
                    state={FROM_HOY}
                    aria-label={`${c.state === 'recarga' ? 'Recarga' : PHASE_NAMES[c.state]}, desde el ${shortDate.format(toJsDate(c.date))}. Ver qué significa`}
                  >
                    <i aria-hidden="true" />
                    <span className="ciclo__next-name">{c.state === 'recarga' ? 'Recarga (regla)' : PHASE_NAMES[c.state]}</span>
                    <span className="ciclo__next-date">{shortDate.format(toJsDate(c.date))}</span>
                    <span className="ciclo__chevron" aria-hidden="true">
                      ›
                    </span>
                  </Link>
                </li>
              ))}
            </ol>
            <p className="ciclo__footnote">
              {nextPeriodText(status)} <Link to="/historial">Ver historial</Link>
            </p>
          </section>

          <div className="ciclo__actions">
            {error && <p className="ciclo__error">No se ha guardado. Prueba otra vez.</p>}
            {status.periodOngoing && status.periodEndLogged ? (
              <p className="ciclo__done">Apuntado: hoy es el último día de regla.</p>
            ) : status.periodOngoing ? (
              <button type="button" className="btn btn--ghost" disabled={busy} onClick={() => run(onPeriodEnded)}>
                Ya terminó la regla
              </button>
            ) : (
              <button type="button" className="btn btn--period" disabled={busy} onClick={() => setRegistering(true)}>
                Me ha venido la regla
              </button>
            )}
          </div>

          <Instalar />

          {registering && (
            <PeriodSheet
              mode="ha-llegado"
              periods={periods}
              onSave={async (period) => {
                await onPeriodStarted(period)
                setFresh(true)
                window.setTimeout(() => setFresh(false), 3200)
              }}
              onClose={() => setRegistering(false)}
            />
          )}
        </div>
      </div>
      <TabBar />
    </main>
  )
}
