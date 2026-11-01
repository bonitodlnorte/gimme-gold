import { useState } from 'react'
import { Billy } from '../components/Billy'
import { MonthPicker } from '../components/MonthPicker'
import { AVISO_NO_ANTICONCEPTIVO } from '../content/fases'
import { DEFAULT_LENGTH, MAX_LENGTH, MIN_LENGTH, sortedStarts, type Contraception } from '../domain/cycle'
import { addDays, toJsDate, today, type LocalDate } from '../domain/dates'
import type { LegacyData } from '../domain/legacyImport'
import type { Onboarding } from '../data/store'
import './Alta.css'

// Steps 2–4 of the sign-up (D18), plus the import screen shown after step 1 when the old
// app left data in this browser. Importing skips steps 2 and 3.

export function Progress({ step }: { step: 1 | 2 | 3 | 4 }) {
  return (
    <div className="progress" role="progressbar" aria-valuemin={1} aria-valuemax={4} aria-valuenow={step} aria-label={`Paso ${step} de 4`}>
      {[1, 2, 3, 4].map((n) => (
        <span key={n} className={n <= step ? 'is-done' : undefined} />
      ))}
    </div>
  )
}

const monthYear = new Intl.DateTimeFormat('es-ES', { month: 'long', year: 'numeric' })
const shortDate = new Intl.DateTimeFormat('es-ES', { day: 'numeric', month: 'short' })

type Step = 'importar' | 'regla' | 'duracion' | 'anticonceptivos'

interface Props {
  legacy: LegacyData | null
  onDone: (data: Onboarding) => Promise<void>
}

export function AltaScreen({ legacy, onDone }: Props) {
  const [step, setStep] = useState<Step>(legacy ? 'importar' : 'regla')
  const [imported, setImported] = useState(false)
  const [lastPeriod, setLastPeriod] = useState<LocalDate | null>(null)
  const [length, setLength] = useState<number | null>(DEFAULT_LENGTH)
  const [contraception, setContraception] = useState<Contraception | null>(null)
  const [consent, setConsent] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function finish() {
    if (!contraception) return
    const periods = imported && legacy ? legacy.periods : lastPeriod ? [{ start: lastPeriod }] : []
    const declaredLength = imported && legacy ? legacy.declaredLength : length
    setBusy(true)
    setError(null)
    try {
      await onDone({ settings: { declaredLength, contraception }, periods, imported })
    } catch {
      setError('No he podido guardar tus datos. Prueba otra vez.')
      setBusy(false)
    }
  }

  if (step === 'importar' && legacy) {
    const starts = sortedStarts(legacy.periods)
    const first = starts[0]
    const last = starts[starts.length - 1]
    return (
      <main className="screen alta">
        <Progress step={1} />
        <div className="alta__billy">
          <Billy mood="fiesta" size={120} />
          <h1 className="alta__title">¡Nos conocíamos!</h1>
          <p className="alta__lead">He encontrado en este navegador lo que apuntaste en la versión anterior de Gimme Gold.</p>
        </div>
        <dl className="alta__summary">
          <div>
            <dt>Reglas registradas</dt>
            <dd>{starts.length}</dd>
          </div>
          {first && (
            <div>
              <dt>Desde</dt>
              <dd>{monthYear.format(toJsDate(first))}</dd>
            </div>
          )}
          {last && (
            <div>
              <dt>Última regla</dt>
              <dd>{shortDate.format(toJsDate(last))}</dd>
            </div>
          )}
        </dl>
        <p className="alta__hint">Si los guardas en tu cuenta, no los perderás aunque cambies de móvil. Te ahorras dos pasos del alta.</p>
        <div className="alta__actions">
          <button type="button" className="btn btn--go" onClick={() => (setImported(true), setStep('anticonceptivos'))}>
            Guardar en mi cuenta
          </button>
          <button type="button" className="btn btn--ghost" onClick={() => (setImported(false), setStep('regla'))}>
            Empezar de cero
          </button>
        </div>
      </main>
    )
  }

  if (step === 'regla') {
    return (
      <main className="screen alta">
        <Progress step={2} />
        <h1 className="alta__title">¿Cuándo empezó tu última regla?</h1>
        <MonthPicker value={lastPeriod} onChange={setLastPeriod} />
        <div className="alta__chips">
          <button type="button" className={`chip chip--button${lastPeriod === today() ? ' is-on' : ''}`} onClick={() => setLastPeriod(today())}>
            Hoy
          </button>
          <button
            type="button"
            className={`chip chip--button${lastPeriod === addDays(today(), -1) ? ' is-on' : ''}`}
            onClick={() => setLastPeriod(addDays(today(), -1))}
          >
            Ayer
          </button>
        </div>
        <p className="alta__hint">¿No te acuerdas exacto? Marca el día que más se acerque. Lo afino cuando apuntes la siguiente.</p>
        <div className="alta__actions">
          <button type="button" className="btn btn--go" disabled={!lastPeriod} onClick={() => setStep('duracion')}>
            Continuar
          </button>
          {legacy && (
            <button type="button" className="alta__link" onClick={() => setStep('importar')}>
              Volver
            </button>
          )}
        </div>
      </main>
    )
  }

  if (step === 'duracion') {
    const value = length ?? DEFAULT_LENGTH
    return (
      <main className="screen alta">
        <Progress step={3} />
        <h1 className="alta__title">¿Cuántos días suele durar tu ciclo?</h1>
        <p className="alta__lead">De un día 1 de regla al siguiente. Si no lo sabes, no pasa nada: lo iré afinando con lo que registres.</p>
        <div className="stepper">
          <button type="button" aria-label="Un día menos" disabled={value <= MIN_LENGTH} onClick={() => setLength(value - 1)}>
            −
          </button>
          <output aria-live="polite">
            <strong>{value}</strong> días
          </output>
          <button type="button" aria-label="Un día más" disabled={value >= MAX_LENGTH} onClick={() => setLength(value + 1)}>
            +
          </button>
        </div>
        <p className="alta__hint">Entre 21 y 35 días es lo normal. Yo los cuento con los dedos, que tengo muchos.</p>
        <div className="alta__actions">
          <button type="button" className="btn btn--go" onClick={() => setStep('anticonceptivos')}>
            Continuar
          </button>
          <button type="button" className="btn btn--ghost" onClick={() => (setLength(null), setStep('anticonceptivos'))}>
            No lo sé, pon 28
          </button>
          <button type="button" className="alta__link" onClick={() => setStep('regla')}>
            Volver
          </button>
        </div>
      </main>
    )
  }

  const options: { value: Contraception; label: string }[] = [
    { value: 'no', label: 'No' },
    { value: 'si', label: 'Sí' },
    { value: 'no_decir', label: 'Prefiero no decirlo' },
  ]
  return (
    <main className="screen alta">
      <Progress step={4} />
      <h1 className="alta__title">¿Tomas anticonceptivos hormonales?</h1>
      <p className="alta__lead">Píldora, anillo, parche, DIU hormonal, implante… Cambian cómo funcionan tus hormonas, así que necesito saberlo.</p>
      <div className="alta__options" role="radiogroup">
        {options.map((o) => (
          <button
            key={o.value}
            type="button"
            role="radio"
            aria-checked={contraception === o.value}
            className={`option${contraception === o.value ? ' is-on' : ''}`}
            onClick={() => setContraception(o.value)}
          >
            {o.label}
          </button>
        ))}
      </div>
      {contraception === 'si' && (
        <p className="alta__warn">
          <strong>Ojo:</strong> con la mayoría de anticonceptivos hormonales no hay ovulación natural. Te enseñaré las fases
          igualmente, pero como orientación: puede que no reflejen lo que sientes. Y no verás ventana fértil.
        </p>
      )}
      <label className="consent">
        <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} />
        <span>
          Acepto que Gimme Gold guarde mis datos de salud (fechas de regla y notas) para calcular mi ciclo. Puedo borrarlos
          cuando quiera. {AVISO_NO_ANTICONCEPTIVO}
        </span>
      </label>
      {error && <p className="alta__error">{error}</p>}
      <div className="alta__actions">
        <button type="button" className="btn btn--go" disabled={!contraception || !consent || busy} onClick={finish}>
          Empezar
        </button>
        <button type="button" className="alta__link" onClick={() => setStep(imported ? 'importar' : 'duracion')}>
          Volver
        </button>
      </div>
    </main>
  )
}
