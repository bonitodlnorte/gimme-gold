import { useState } from 'react'
import { Billy } from '../components/Billy'
import { MonthPicker } from '../components/MonthPicker'
import { Sheet } from '../components/Sheet'
import type { Period } from '../domain/cycle'
import { addDays, today, type LocalDate } from '../domain/dates'
import { checkPeriod, type PeriodError } from '../domain/periods'
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

function DateChoice({
  label,
  value,
  onChange,
  emptyLabel,
}: {
  label: string
  value: LocalDate | null
  onChange: (date: LocalDate | null) => void
  /** When given, the date is optional and this option clears it. */
  emptyLabel?: string
}) {
  const now = today()
  const yesterday = addDays(now, -1)
  const isOther = value !== null && value !== now && value !== yesterday
  const [picking, setPicking] = useState(isOther)

  const options: { key: string; label: string; on: boolean; pick: () => void }[] = [
    ...(emptyLabel ? [{ key: 'none', label: emptyLabel, on: value === null && !picking, pick: () => (setPicking(false), onChange(null)) }] : []),
    { key: 'hoy', label: 'Hoy', on: value === now && !picking, pick: () => (setPicking(false), onChange(now)) },
    { key: 'ayer', label: 'Ayer', on: value === yesterday && !picking, pick: () => (setPicking(false), onChange(yesterday)) },
    { key: 'otro', label: 'Otro día', on: picking, pick: () => setPicking(true) },
  ]

  return (
    <fieldset className="psheet__field">
      <legend>{label}</legend>
      <div className="psheet__choices" data-count={options.length}>
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
  const [end, setEnd] = useState<LocalDate | null>(initial?.end ?? null)
  const [note, setNote] = useState(initial?.note ?? '')
  const [busy, setBusy] = useState(false)
  const [failed, setFailed] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)

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

  const title = mode === 'ha-llegado' ? 'Ha llegado' : mode === 'nueva' ? 'Apuntar una regla' : 'Editar regla'

  return (
    <Sheet label={title} onClose={onClose}>
      <div className="psheet__head">
        {mode === 'ha-llegado' && (
          <div className="psheet__billy">
            <Billy mood="desolado" size={84} />
          </div>
        )}
        <div>
          <h2>{title}</h2>
          {mode === 'ha-llegado' && <p>Lo siento muchísimo. Estoy desolado.</p>}
          {mode === 'nueva' && <p>Para que no se me escape ninguna.</p>}
        </div>
      </div>

      <DateChoice label="¿Cuándo empezó?" value={start} onChange={setStart} />
      {mode !== 'ha-llegado' && start && (
        <DateChoice label="¿Cuándo terminó?" value={end} onChange={setEnd} emptyLabel="No lo sé" />
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
