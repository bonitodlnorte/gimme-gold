import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Sheet } from '../components/Sheet'
import { TabBar } from '../components/TabBar'
import { FICHAS_FASE } from '../content/aprender'
import { PARA_ELLA } from '../content/fases'
import { AVISO_FERTIL_PLAN, AVISO_PLAN, AVISO_RETRASO, CONSEJO_FECHA, OBJETIVOS, STATE_NAMES } from '../content/plan'
import type { Contraception, CycleStatus, Period } from '../domain/cycle'
import { addDays, toJsDate, type LocalDate } from '../domain/dates'
import { HORIZON_DAYS, forecast, goalWindows, onFire, suits, type ForecastDay, type GoalId } from '../domain/plan'
import type { BackTo } from './Aprender'
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

/** A "maybe" period is not drawn on the calendar: only the expected days get a drop. */
function showsDrop(day: ForecastDay): boolean {
  return day.period === 'en_curso' || day.period === 'probable'
}

interface Props {
  status: CycleStatus
  periods: Period[]
  contraception: Contraception
}

export function PlanScreen({ status, periods, contraception }: Props) {
  const fc = useMemo(() => forecast(status, periods), [status, periods])
  const [goal, setGoal] = useState<GoalId | null>(null)
  const [open, setOpen] = useState<{ day: ForecastDay; planned: boolean } | null>(null)
  const [pickDate, setPickDate] = useState(false)
  const [picked, setPicked] = useState('')
  // No ovulation with hormonal contraception, and while the period is late the dates are only a guess.
  const showFire = contraception !== 'si' && !fc.late
  const fireFor = (day: ForecastDay) => showFire && onFire(day)

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

  function goToMonth(date: LocalDate) {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    document.getElementById(`mes-${date.slice(0, 7)}`)?.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' })
  }

  return (
    <main className="screen plan">
      <header>
        <h1 className="plan__title">Plan</h1>
        <p className="plan__lead">Seis meses de tu ciclo. Dime qué quieres planificar y te marco los mejores días.</p>
      </header>

      <button type="button" className="btn btn--ghost" onClick={() => setPickDate(true)}>
        ¿Cómo estaré tal día?
      </button>

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
              <>
                <p>
                  <strong>Tus mejores días</strong>, marcados con ★ en el calendario:
                </p>
                <ul className="plan__windows">
                  {windows.map((w) => (
                    <li key={w.from}>
                      <button type="button" className="plan__window" onClick={() => goToMonth(w.from)}>
                        {rangeText(w.from, w.to)}
                      </button>
                    </li>
                  ))}
                </ul>
              </>
            ) : (
              <p>No encuentro días buenos para esto en los próximos meses.</p>
            )}
          </div>
        )}
      </section>

      {fc.late && <p className="ciclo__note ciclo__note--warn">{AVISO_RETRASO}</p>}

      {/* Colour always means the phase; a goal only adds the star and greys out the rest. */}
      <div className="plan__legend" aria-hidden="true">
        <span>
          <i className="plan__swatch plan__swatch--recarga" />
          {STATE_NAMES.recarga}
        </span>
        {(['poder1', 'manifestacion', 'poder2', 'mimos'] as const).map((p) => (
          <span key={p} data-phase={p}>
            <i className="plan__swatch" />
            {STATE_NAMES[p]}
          </span>
        ))}
        <span>
          <i className="plan__drop" />
          Regla
        </span>
        {showFire && <span className="plan__legend-fire">🔥 On fire: cerca de la ovulación, libido y fertilidad a tope</span>}
        {objetivo && (
          <>
            <span className="plan__legend-goal">
              <b className="plan__star">★</b>
              Buen día para {objetivo.label.toLowerCase()}
            </span>
            <span>
              <i className="plan__swatch plan__swatch--dim" />
              No conviene
            </span>
          </>
        )}
      </div>

      {months.map((month) => (
        <section key={month.key} id={`mes-${month.key}`} className="plan__month" aria-label={monthYear.format(toJsDate(month.first))}>
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
              const fire = fireFor(day)
              return (
                <button
                  key={date}
                  type="button"
                  data-phase={day.phase}
                  className={[
                    'plan__day',
                    date === status.date && 'is-today',
                    day.state === 'recarga' && 'is-recarga',
                    good === true && 'is-good',
                    good === false && 'is-dim',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                  aria-label={`${longDate.format(toJsDate(date))}: ${STATE_NAMES[day.state]}${showsDrop(day) ? `, ${PERIOD_TEXT[day.period!].toLowerCase()}` : ''}${fire ? ', on fire: libido y fertilidad a tope' : ''}${good ? ', buen día' : ''}`}
                  onClick={() => setOpen({ day, planned: false })}
                >
                  {good && (
                    <b className="plan__star" aria-hidden="true">
                      ★
                    </b>
                  )}
                  {Number(date.slice(8))}
                  {showsDrop(day) && <i className="plan__drop" />}
                  {fire && (
                    <span className="plan__marks" aria-hidden="true">
                      🔥
                    </span>
                  )}
                </button>
              )
            })}
          </div>
        </section>
      ))}

      <p className="plan__fine">{AVISO_PLAN}</p>

      <TabBar />

      {pickDate && (
        <Sheet label="¿Cómo estaré tal día?" onClose={() => setPickDate(false)}>
          <h2 className="plan__sheet-title">¿Qué día quieres mirar?</h2>
          <p className="plan__sheet-text">Un viaje, una competición, una cita… Elige la fecha y te digo cómo te pillará.</p>
          {/* Wait for the button: iPhone and desktop pickers fire change while she browses months. */}
          <input
            type="date"
            className="field"
            min={status.date}
            max={last}
            aria-label="Fecha"
            value={picked}
            onChange={(e) => setPicked(e.target.value)}
          />
          <button
            type="button"
            className="btn btn--go"
            disabled={!byDate.has(picked)}
            onClick={() => {
              const day = byDate.get(picked)
              if (day) {
                setPickDate(false)
                setOpen({ day, planned: true })
              }
            }}
          >
            Ver cómo estaré
          </button>
        </Sheet>
      )}

      {open && (
        <DaySheet day={open.day} planned={open.planned} cycleLength={fc.cycleLength} fire={fireFor(open.day)} onClose={() => setOpen(null)} />
      )}
    </main>
  )
}

function DaySheet({
  day,
  planned,
  cycleLength,
  fire,
  onClose,
}: {
  day: ForecastDay
  planned: boolean
  cycleLength: number
  fire: boolean
  onClose: () => void
}) {
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
        {fire && (
          <p className="ciclo__note ciclo__note--info">
            🔥 On fire: estás cerca de la ovulación, con la libido y la fertilidad a tope. {AVISO_FERTIL_PLAN}
          </p>
        )}
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
        <Link to={`/aprender/${day.phase}`} state={{ back: '/plan', backLabel: 'Plan' } satisfies BackTo} className="alta__link plan__more">
          Saber más de {STATE_NAMES[day.phase]}
        </Link>
      </div>
    </Sheet>
  )
}
