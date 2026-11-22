import { useState } from 'react'
import { Billy } from '../components/Billy'
import { MonthPicker } from '../components/MonthPicker'
import { Sheet } from '../components/Sheet'
import { DEFAULT_PERIOD_DAYS, type Period } from '../domain/cycle'
import { addDays, daysBetween, toJsDate, today, type LocalDate } from '../domain/dates'
import { checkPeriod, type PeriodError } from '../domain/periods'
import './Alta.css'
import './PeriodSheet.css'

// Registers a period that just arrived (G-Registrar), adds a past one or edits one from the history.

export type PeriodSheetMode = 'ha-llegado' | 'nueva' | 'editar'

const ERRORS: Record<PeriodError, string> = {
  futuro: 'Esa fecha aún no ha llegado.',
  duplicada: 'Ya tienes una regla apuntada ese día.',
  fin_antes: 'La regla no puede terminar antes de empezar.',
  fin_futuro: 'El último día no puede ser una fecha futura.',
}

/** How far back the history can be filled in. */
const HISTORY_MONTHS_BACK = 24

/** The longest period the day counter offers. */
const MAX_DAYS = 14

const longDate = new Intl.DateTimeFormat('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })
const dayMonth = new Intl.DateTimeFormat('es-ES', { day: 'numeric', month: 'long' })

/** The start of a period that just arrived: almost always today or yesterday. */
function DateChoice({
  label,
  value,
  onChange,
}: {
  label: string
  value: LocalDate | null
  onChange: (date: LocalDate) => void
}) {
  const now = today()
  const yesterday = addDays(now, -1)
  const isOther = value !== null && value !== now && value !== yesterday
  const [picking, setPicking] = useState(isOther)

  const options: { key: string; label: string; on: boolean; pick: () => void }[] = [
    { key: 'hoy', label: 'Hoy', on: value === now && !picking, pick: () => (setPicking(false), onChange(now)) },
    { key: 'ayer', label: 'Ayer', on: value === yesterday && !picking, pick: () => (setPicking(false), onChange(yesterday)) },
    { key: 'otro', label: 'Otro día', on: picking, pick: () => setPicking(true) },
  ]

  return (
    <fieldset className="psheet__field">
      <legend>{label}</legend>
      <div className="psheet__choices">
        {options.map((o) => (
          <button key={o.key} type="button" aria-pressed={o.on} className={`psheet__choice${o.on ? ' is-on' : ''}`} onClick={o.pick}>
            {o.label}
          </button>
        ))}
      </div>
      {picking && <MonthPicker value={value} onChange={onChange} maxMonthsBack={HISTORY_MONTHS_BACK} />}
    </fieldset>
  )
}

/** The start of a period from the history: a calendar, with no Hoy/Ayer shortcuts. */
function PastDate({ label, value, onChange }: { label: string; value: LocalDate | null; onChange: (date: LocalDate) => void }) {
  const [picking, setPicking] = useState(value === null)

  return (
    <fieldset className="psheet__field">
      <legend>{label}</legend>
      {value && (
        <div className="psheet__date">
          <strong>{longDate.format(toJsDate(value))}</strong>
          {!picking && (
            <button type="button" className="psheet__change" onClick={() => setPicking(true)}>
              Cambiar
            </button>
          )}
        </div>
      )}
      {picking && <MonthPicker value={value} onChange={onChange} maxMonthsBack={HISTORY_MONTHS_BACK} />}
    </fieldset>
  )
}

/** How many days a period lasted, counting the first one. Null when she does not know. */
function DaysChoice({
  start,
  value,
  max,
  onChange,
}: {
  start: LocalDate
  value: number | null
  max: number
  onChange: (days: number | null) => void
}) {
  return (
    <fieldset className="psheet__field">
      <legend>¿Cuántos días duró?</legend>
      <div className="stepper">
        <button type="button" aria-label="Un día menos" disabled={value === null || value <= 1} onClick={() => onChange((value ?? 2) - 1)}>
          −
        </button>
        <output aria-live="polite">
          {value === null ? (
            'No lo sé'
          ) : (
            <>
              <strong>{value}</strong> {value === 1 ? 'día' : 'días'}
            </>
          )}
        </output>
        <button
          type="button"
          aria-label="Un día más"
          disabled={value !== null && value >= max}
          onClick={() => onChange(value === null ? Math.min(DEFAULT_PERIOD_DAYS, max) : value + 1)}
        >
          +
        </button>
      </div>
      {value !== null && (
        <p className="psheet__hint">
          {value === 1
            ? `Solo el ${dayMonth.format(toJsDate(start))}.`
            : `Del ${
                start.slice(0, 7) === addDays(start, value - 1).slice(0, 7) ? Number(start.slice(8)) : dayMonth.format(toJsDate(start))
              } al ${dayMonth.format(toJsDate(addDays(start, value - 1)))}.`}{' '}
          <button type="button" className="psheet__change" onClick={() => onChange(null)}>
            No lo sé
          </button>
        </p>
      )}
    </fieldset>
  )
}

interface Props {
  mode: PeriodSheetMode
  /** All her periods, to check the new dates against. */
  periods: Period[]
  /** The period being edited. */
  initial?: Period
  onSave: (period: Period) => Promise<void>
  onDelete?: () => Promise<void>
  onClose: () => void
}

export function PeriodSheet({ mode, periods, initial, onSave, onDelete, onClose }: Props) {
  const [start, setStart] = useState<LocalDate | null>(initial?.start ?? (mode === 'ha-llegado' ? today() : null))
  const [days, setDays] = useState<number | null>(initial?.end ? daysBetween(initial.start, initial.end) + 1 : null)
  const [note, setNote] = useState(initial?.note ?? '')
  const [busy, setBusy] = useState(false)
  const [failed, setFailed] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)

  // The length is what she sets: moving the start moves the end with it, never past today.
  const maxDays = start ? Math.max(1, Math.min(daysBetween(start, today()) + 1, Math.max(MAX_DAYS, days ?? 0))) : 1
  const shownDays = days === null ? null : Math.min(days, maxDays)
  const end = start && shownDays !== null ? addDays(start, shownDays - 1) : null

  const candidate: Period | null = start ? { start, end, note } : null
  const check = candidate ? checkPeriod(periods, candidate, today(), initial?.start) : null

  async function run(action: () => Promise<void>) {
    setBusy(true)
    setFailed(false)
    try {
      await action()
      onClose()
    } catch {
      setFailed(true)
      setBusy(false)
    }
  }

  const title = mode === 'ha-llegado' ? '¡Ciclo nuevo!' : mode === 'nueva' ? 'Apuntar una regla' : 'Editar regla'

  return (
    <Sheet label={title} onClose={onClose}>
      <div className="psheet__head">
        {mode === 'ha-llegado' && (
          <div className="psheet__billy">
            <Billy mood="meditando" size={84} />
          </div>
        )}
        <div>
          <h2>{title}</h2>
          {mode === 'ha-llegado' && <p>Modo recarga activado. Apúntalo y a la manta.</p>}
          {mode === 'nueva' && <p>Para que no se me escape ninguna.</p>}
        </div>
      </div>

      {mode === 'ha-llegado' ? (
        <DateChoice label="¿Cuándo empezó?" value={start} onChange={setStart} />
      ) : (
        <>
          <PastDate label="¿Qué día empezó?" value={start} onChange={setStart} />
          {start && start <= today() && <DaysChoice start={start} value={shownDays} max={maxDays} onChange={setDays} />}
        </>
      )}

      <div className="psheet__field">
        <label htmlFor="nota">
          Nota <span>(opcional)</span>
        </label>
        <textarea
          id="nota"
          rows={3}
          maxLength={1000}
          placeholder="Cómo te encuentras, lo que quieras apuntar…"
          value={note}
          onChange={(e) => setNote(e.target.value)}
        />
      </div>

      {check?.error && <p className="psheet__error">{ERRORS[check.error]}</p>}
      {!check?.error && check?.tooCloseDays && (
        <p className="psheet__warn">
          Solo hay {check.tooCloseDays} {check.tooCloseDays === 1 ? 'día' : 'días'} con otra regla apuntada. ¿Seguro que no es la
          misma?
        </p>
      )}
      {mode === 'ha-llegado' && <p className="psheet__hint">Cuando termine, toca «Ya terminó» en la pantalla de Ciclo. Es opcional.</p>}
      {failed && <p className="psheet__error">No se ha guardado. Prueba otra vez.</p>}

      <button
        type="button"
        className="btn btn--period"
        disabled={!candidate || !!check?.error || busy}
        onClick={() => candidate && run(() => onSave(candidate))}
      >
        {check?.tooCloseDays ? 'Guardar igualmente' : 'Guardar'}
      </button>

      {onDelete &&
        (confirmDelete ? (
          <button type="button" className="btn btn--ghost psheet__delete" disabled={busy} onClick={() => run(onDelete)}>
            Sí, borrar esta regla
          </button>
        ) : (
          <button type="button" className="psheet__link" onClick={() => setConfirmDelete(true)}>
            Borrar esta regla
          </button>
        ))}
    </Sheet>
  )
}
