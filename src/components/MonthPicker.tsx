import { useEffect, useMemo, useState } from 'react'
import { addDays, daysBetween, toJsDate, today, type LocalDate } from '../domain/dates'
import './MonthPicker.css'

const monthYear = new Intl.DateTimeFormat('es-ES', { month: 'long', year: 'numeric' })
const shortDate = new Intl.DateTimeFormat('es-ES', { day: 'numeric', month: 'short' })

const WEEKDAYS = ['L', 'M', 'X', 'J', 'V', 'S', 'D']

function monthIndex(date: LocalDate): number {
  return Number(date.slice(0, 4)) * 12 + Number(date.slice(5, 7)) - 1
}

function monthStart(index: number): LocalDate {
  return `${Math.floor(index / 12)}-${String((index % 12) + 1).padStart(2, '0')}-01`
}

interface Props {
  value: LocalDate | null
  onChange: (date: LocalDate) => void
  /** How many months before the current one can be shown. */
  maxMonthsBack?: number
}

/** A month calendar for picking a past day, Monday first. Future days are disabled. */
export function MonthPicker({ value, onChange, maxMonthsBack = 3 }: Props) {
  const now = today()
  const [month, setMonth] = useState(monthIndex(value ?? now))
  const monthsBack = monthIndex(now) - month

  // Hoy/Ayer can pick a day in another month: show it.
  useEffect(() => {
    if (value) setMonth(monthIndex(value))
  }, [value])

  const cells = useMemo(() => {
    const start = monthStart(month)
    const offset = (toJsDate(start).getDay() + 6) % 7 // Monday first
    const daysInMonth = daysBetween(start, monthStart(month + 1))
    return [...Array<null>(offset).fill(null), ...Array.from({ length: daysInMonth }, (_, i) => addDays(start, i))]
  }, [month])

  const shift = (by: number) => setMonth(month + by)

  return (
    <div className="month">
      <div className="month__head">
        <button type="button" aria-label="Mes anterior" disabled={monthsBack >= maxMonthsBack} onClick={() => shift(-1)}>
          ‹
        </button>
        <span className="month__name">{monthYear.format(toJsDate(monthStart(month)))}</span>
        <button type="button" aria-label="Mes siguiente" disabled={monthsBack <= 0} onClick={() => shift(1)}>
          ›
        </button>
      </div>
      <div className="month__grid">
        {WEEKDAYS.map((d) => (
          <span key={d} className="month__wd">
            {d}
          </span>
        ))}
        {cells.map((date, i) =>
          date ? (
            <button
              key={date}
              type="button"
              className={`month__day${date === value ? ' is-on' : ''}${date === now ? ' is-today' : ''}`}
              disabled={date > now}
              aria-pressed={date === value}
              aria-label={shortDate.format(toJsDate(date))}
              onClick={() => onChange(date)}
            >
              {Number(date.slice(8))}
            </button>
          ) : (
            <span key={`empty-${i}`} />
          ),
        )}
      </div>
    </div>
  )
}
