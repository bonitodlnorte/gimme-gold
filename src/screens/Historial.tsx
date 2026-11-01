import { useState } from 'react'
import { Link } from 'react-router-dom'
import type { LengthEstimate, Period } from '../domain/cycle'
import { toJsDate, type LocalDate } from '../domain/dates'
import { historyRows } from '../domain/periods'
import { PeriodSheet } from './PeriodSheet'
import './Historial.css'

const day = new Intl.DateTimeFormat('es-ES', { day: 'numeric' })
const month = new Intl.DateTimeFormat('es-ES', { month: 'short' })

function lengthText(estimate: LengthEstimate): string {
  if (estimate.source === 'historial') return `Mediana de ${estimate.basedOn} ${estimate.basedOn === 1 ? 'ciclo' : 'ciclos'}`
  if (estimate.source === 'declarada') return 'Lo que me dijiste'
  return 'Por defecto, hasta que apuntes más'
}

interface Props {
  periods: Period[]
  estimate: LengthEstimate
  /** The current period has started and not ended yet. */
  periodOngoing: boolean
  onAdd: (period: Period) => Promise<void>
  onUpdate: (start: LocalDate, period: Period) => Promise<void>
  onDelete: (start: LocalDate) => Promise<void>
}

type Editing = { mode: 'nueva' } | { mode: 'editar'; period: Period }

export function HistorialScreen({ periods, estimate, periodOngoing, onAdd, onUpdate, onDelete }: Props) {
  const [editing, setEditing] = useState<Editing | null>(null)
  const rows = historyRows(periods)

  return (
    <main className="screen historial">
      <header className="historial__head">
        <Link to="/" className="historial__back" aria-label="Volver a Ciclo">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </Link>
        <h1>Historial</h1>
      </header>

      <div className="historial__stats">
        <div className="stat">
          <span className="stat__label">Tu ciclo</span>
          <span className="stat__value">{estimate.length} días</span>
          <span className="stat__note">{lengthText(estimate)}</span>
        </div>
        <div className="stat">
          <span className="stat__label">Varía</span>
          {estimate.spread === null ? (
            <>
              <span className="stat__value">¿?</span>
              <span className="stat__note">Necesito dos ciclos completos</span>
            </>
          ) : (
            <>
              <span className="stat__value">± {Math.ceil(estimate.spread / 2)} días</span>
              <span className={`stat__note ${estimate.irregular ? 'is-irregular' : 'is-regular'}`}>
                {estimate.irregular ? 'Bastante irregular' : 'Bastante regular'}
              </span>
            </>
          )}
        </div>
      </div>

      <ol className="historial__list">
        {rows.map((row, i) => {
          const { period } = row
          const details = [
            row.periodDays !== null
              ? `Regla de ${row.periodDays} ${row.periodDays === 1 ? 'día' : 'días'}`
              : i === 0 && periodOngoing
                ? 'Regla en curso'
                : 'Sin fecha de fin',
            period.note ? `«${period.note}»` : null,
          ].filter(Boolean)
          return (
            <li key={period.start}>
              {row.suspicious && (
                <button type="button" className="historial__gap" onClick={() => setEditing({ mode: 'nueva' })}>
                  ¿Se te olvidó apuntar alguna por aquí? {row.cycleLength} días es mucho hasta para mí.
                  <span>Apuntar</span>
                </button>
              )}
              <button type="button" className="historial__row" onClick={() => setEditing({ mode: 'editar', period })}>
                <span className="historial__date">
                  <span>{day.format(toJsDate(period.start))}</span>
                  <span>{month.format(toJsDate(period.start)).replace('.', '')}</span>
                </span>
                <span className="historial__text">
                  <span className="historial__title">{i === 0 ? 'Ciclo actual' : `${row.cycleLength} días`}</span>
                  <span className="historial__note">{details.join(' · ')}</span>
                </span>
                <span className="historial__len">{row.cycleLength === null ? 'en curso' : `${row.cycleLength} d`}</span>
              </button>
            </li>
          )
        })}
      </ol>

      <button type="button" className="btn btn--ghost" onClick={() => setEditing({ mode: 'nueva' })}>
        Apuntar una regla pasada
      </button>

      {editing?.mode === 'nueva' && (
        <PeriodSheet mode="nueva" periods={periods} onSave={onAdd} onClose={() => setEditing(null)} />
      )}
      {editing?.mode === 'editar' && (
        <PeriodSheet
          mode="editar"
          periods={periods}
          initial={editing.period}
          onSave={(p) => onUpdate(editing.period.start, p)}
          onDelete={periods.length > 1 ? () => onDelete(editing.period.start) : undefined}
          onClose={() => setEditing(null)}
        />
      )}
    </main>
  )
}
