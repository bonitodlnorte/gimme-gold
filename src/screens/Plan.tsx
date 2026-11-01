import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Sheet } from '../components/Sheet'
import { TabBar } from '../components/TabBar'
import { FICHAS_FASE } from '../content/aprender'
import { PARA_ELLA } from '../content/fases'
import { AVISO_PLAN, AVISO_RETRASO, CONSEJO_FECHA, OBJETIVOS, STATE_NAMES } from '../content/plan'
import type { CycleStatus, Period } from '../domain/cycle'
import { addDays, toJsDate, type LocalDate } from '../domain/dates'
import { HORIZON_DAYS, forecast, goalWindows, suits, type ForecastDay, type GoalId } from '../domain/plan'
import './Alta.css'
import './Ciclo.css'
import './Plan.css'

// Plan (D23, D24): six months of phases and predicted periods, the best days for a goal,
// and what a planned date will look like.

const monthYear = new Intl.DateTimeFormat('es-ES', { month: 'long', year: 'numeric' })
const longDate = new Intl.DateTimeFormat('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })
const shortDate = new Intl.DateTimeFormat('es-ES', { day: 'numeric', month: 'short' })
const WEEKDAYS = ['L', 'M', 'X', 'J', 'V', 'S', 'D']

function rangeText(from: LocalDate, to: LocalDate): string {
  const a = shortDate.format(toJsDate(from)).replace('.', '')
  const b = shortDate.format(toJsDate(to)).replace('.', '')
  return from === to ? a : `${a} – ${b}`
}

const PERIOD_TEXT = {
  en_curso: 'Tienes la regla',
  probable: 'Regla prevista',
  posible: 'Puede que te venga la regla',
} as const

interface Props {
  status: CycleStatus
  periods: Period[]
}

export function PlanScreen({ status, periods }: Props) {
  const fc = useMemo(() => forecast(status, periods), [status, periods])
  const [goal, setGoal] = useState<GoalId | null>(null)
  const [open, setOpen] = useState<{ day: ForecastDay; planned: boolean } | null>(null)
  const [pickDate, setPickDate] = useState(false)

  const byDate = useMemo(() => new Map(fc.days.map((d) => [d.date, d])), [fc])
  const months = useMemo(() => {
    const result: { key: string; first: LocalDate; dates: (LocalDate | null)[] }[] = []
    for (const day of fc.days) {
      const key = day.date.slice(0, 7)
      let month = result[result.length - 1]
      if (!month || month.key !== key) {
        const first = `${key}-01`
        const offset = (toJsDate(first).getDay() + 6) % 7
        month = { key, first, dates: Array<null>(offset).fill(null) }
        // Days of the first month before today are shown empty.
        const before = Number(day.date.slice(8)) - 1
        for (let i = 0; i < before; i++) month.dates.push(null)
        result.push(month)
      }
      month.dates.push(day.date)
    }
    return result
  }, [fc])

  const objetivo = OBJETIVOS.find((o) => o.id === goal)
  const windows = goal ? goalWindows(fc, goal).slice(0, 4) : []
  const last = addDays(status.date, HORIZON_DAYS - 1)

  return (
    <main className="screen plan">
      <header>
        <h1 className="plan__title">Plan</h1>
        <p className="plan__lead">Seis meses de tu ciclo. Dime qué quieres planificar y te marco los mejores días.</p>
      </header>

      <section aria-labelledby="plan-goal">
        <h2 id="plan-goal" className="eyebrow">
          ¿Cuándo me conviene…?
        </h2>
        <div className="plan__goals">
          {OBJETIVOS.map((o) => (
            <button
              key={o.id}
              type="button"
              aria-pressed={goal === o.id}
              className={`chip chip--button${goal === o.id ? ' is-on' : ''}`}
              onClick={() => setGoal(goal === o.id ? null : o.id)}
            >
              {o.label}
            </button>
          ))}
        </div>
        {objetivo && (
          <div className="plan__answer" role="status">
            <p>{objetivo.why}</p>
            {windows.length > 0 ? (
              <p>
                <strong>Tus mejores días:</strong> {windows.map((w) => rangeText(w.from, w.to)).join(' · ')}
              </p>
            ) : (
              <p>No encuentro días buenos para esto en los próximos meses.</p>
            )}
          </div>
        )}
      </section>

      <button type="button" className="btn btn--ghost" onClick={() => setPickDate(true)}>
        Tengo una fecha
      </button>

      {fc.late && <p className="ciclo__note ciclo__note--warn">{AVISO_RETRASO}</p>}

      <div className="plan__legend" aria-hidden="true">
        {(['poder1', 'manifestacion', 'poder2', 'mimos'] as const).map((p) => (
          <span key={p} data-phase={p}>
            <i />
            {STATE_NAMES[p]}
          </span>
        ))}
        <span>
          <i className="plan__drop" />
          Regla
        </span>
        <span>
          <i className="plan__drop plan__drop--maybe" />
          Quizá regla
        </span>
      </div>

      {months.map((month) => (
        <section key={month.key} className="plan__month" aria-label={monthYear.format(toJsDate(month.first))}>
          <h2 className="plan__month-name">{monthYear.format(toJsDate(month.first))}</h2>
          <div className="plan__grid">
            {WEEKDAYS.map((d) => (
              <span key={d} className="plan__wd" aria-hidden="true">
                {d}
              </span>
            ))}
            {month.dates.map((date, i) => {
              if (!date) return <span key={`e${i}`} />
              const day = byDate.get(date)!
              const good = goal ? suits(day, goal, fc.cycleLength) : null
              return (
                <button
                  key={date}
                  type="button"
                  data-phase={day.phase}
                  className={[
                    'plan__day',
                    date === status.date && 'is-today',
                    good === true && 'is-good',
                    good === false && 'is-dim',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                  aria-label={`${longDate.format(toJsDate(date))}: ${STATE_NAMES[day.state]}${day.period ? `, ${PERIOD_TEXT[day.period].toLowerCase()}` : ''}${good ? ', buen día' : ''}`}
                  onClick={() => setOpen({ day, planned: false })}
                >
                  {Number(date.slice(8))}
                  {day.period && <i className={`plan__drop${day.period === 'posible' ? ' plan__drop--maybe' : ''}`} />}
                </button>
              )
            })}
          </div>
        </section>
      ))}

      <p className="plan__fine">{AVISO_PLAN}</p>

      <TabBar />

      {pickDate && (
        <Sheet label="Tengo una fecha" onClose={() => setPickDate(false)}>
          <h2 className="plan__sheet-title">¿Qué día es?</h2>
          <p className="plan__sheet-text">Un viaje, una competición, una presentación… Te digo cómo te pillará.</p>
          <input
            type="date"
            className="field"
            min={status.date}
            max={last}
            aria-label="Fecha"
            onChange={(e) => {
              const day = byDate.get(e.target.value)
              if (day) {
                setPickDate(false)
                setOpen({ day, planned: true })
              }
            }}
          />
        </Sheet>
      )}

      {open && <DaySheet day={open.day} planned={open.planned} cycleLength={fc.cycleLength} onClose={() => setOpen(null)} />}
    </main>
  )
}

function DaySheet({ day, planned, cycleLength, onClose }: { day: ForecastDay; planned: boolean; cycleLength: number; onClose: () => void }) {
  const goodFor = OBJETIVOS.filter((o) => suits(day, o.id, cycleLength))
  const summary = day.state === 'recarga' ? PARA_ELLA.regla.headline : FICHAS_FASE[day.phase].resumen
  return (
    <Sheet label={longDate.format(toJsDate(day.date))} onClose={onClose}>
      <div className="plan__sheet" data-phase={day.phase}>
        <p className="eyebrow">{longDate.format(toJsDate(day.date))}</p>
        <h2 className="plan__sheet-title">
          {STATE_NAMES[day.state]}
          {day.cycleIndex > 0 && <span className="plan__estimate"> · estimado</span>}
        </h2>
        <p className="plan__sheet-text">{summary}</p>
        {day.period && <p className="plan__period">{PERIOD_TEXT[day.period]}</p>}
        {day.confidence === 'baja' && <p className="plan__sheet-text">Queda lejos: tómatelo como una idea, no como una cita.</p>}
        {planned && <p className="ciclo__billy plan__advice"><span>Billy</span>{CONSEJO_FECHA[day.state]}</p>}
        {goodFor.length > 0 && (
          <>
            <h3 className="eyebrow">Buen día para</h3>
            <ul className="ciclo__chips">
              {goodFor.map((o) => (
                <li key={o.id} className="chip">
                  {o.label}
                </li>
              ))}
            </ul>
          </>
        )}
        <Link to={`/aprender/${day.phase}`} className="alta__link plan__more">
          Saber más de {STATE_NAMES[day.phase]}
        </Link>
      </div>
    </Sheet>
  )
}
