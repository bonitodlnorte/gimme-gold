import { Billy, moodFor } from '../components/Billy'
import { AVISO_ORIENTATIVO, DATO_FERTIL, PARA_ELLA } from '../content/fases'
import { PHASE_NAMES, projectDays, type Contraception, type CycleStatus } from '../domain/cycle'
import { daysBetween, toJsDate } from '../domain/dates'
import './Ciclo.css'

const dateLabel = new Intl.DateTimeFormat('es-ES', { weekday: 'long', day: 'numeric', month: 'short' })

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
  onPeriodStarted: () => void
  onPeriodEnded: () => void
}

export function CicloScreen({ status, contraception, onPeriodStarted, onPeriodEnded }: Props) {
  const phase = status.phase
  const copy = PARA_ELLA[phase === 'poder1' && status.periodOngoing ? 'regla' : phase]
  const days = projectDays(status, 7)

  return (
    <main className="screen ciclo" data-phase={phase}>
      <header className="ciclo__date">
        <p className="eyebrow">{dateLabel.format(toJsDate(status.date))}</p>
        <h1>
          Día {status.cycleDay} de {status.estimate.length}
        </h1>
      </header>

      {/* Two columns on wide screens: how she is today, then what's next. */}
      <div className="ciclo__body">
        <div className="ciclo__col">
          <section className="ciclo__hero" aria-label={`Fase: ${PHASE_NAMES[phase]}`}>
            <div className="ciclo__hero-text">
              <span className="ciclo__phase">{PHASE_NAMES[phase]}</span>
              <p className="ciclo__headline">{copy.headline}</p>
            </div>
            <Billy mood={moodFor(phase, status.cycleDay)} size={96} />
          </section>

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
            <h2 className="eyebrow">Próximos días</h2>
            <ol className="ciclo__days">
              {days.map((day, i) => (
                <li
                  key={day.date}
                  data-phase={day.phase}
                  className={[i === 0 && 'is-today', day.uncertain && 'is-uncertain'].filter(Boolean).join(' ')}
                  aria-label={`${dateLabel.format(toJsDate(day.date))}: día ${day.cycleDay}, ${PHASE_NAMES[day.phase]}${day.uncertain ? ', estimado' : ''}`}
                >
                  {day.cycleDay}
                  {day.uncertain && day.cycleDay <= 2 ? '?' : ''}
                </li>
              ))}
            </ol>
            <p className="ciclo__footnote">{nextPeriodText(status)}</p>
          </section>

          <div className="ciclo__actions">
            {status.periodOngoing ? (
              <button type="button" className="btn btn--ghost" onClick={onPeriodEnded}>
                Ya terminó la regla
              </button>
            ) : (
              <button type="button" className="btn btn--period" onClick={onPeriodStarted}>
                Me ha venido la regla
              </button>
            )}
          </div>
        </div>
      </div>
    </main>
  )
}
