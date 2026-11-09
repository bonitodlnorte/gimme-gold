import { useState, type ChangeEvent } from 'react'
import { Link } from 'react-router-dom'
import { AvisosAjuste, usePush, type AvisosBackend } from '../components/Avisos'
import { Billy } from '../components/Billy'
import { AVISO_NO_ANTICONCEPTIVO } from '../content/fases'
import {
  DEFAULT_LENGTH,
  MAX_LENGTH,
  MIN_LENGTH,
  type Contraception,
  type CycleSettings,
  type LengthEstimate,
  type Period,
} from '../domain/cycle'
import { today } from '../domain/dates'
import { buildExportFile, parseExportFile } from '../domain/legacyImport'
import './Alta.css'
import './Historial.css'
import './Ajustes.css'

// Ajustes: her cycle settings, the partner link, her data (export, import, delete: GDPR arts. 17
// and 20) and the session.

const CONTRACEPTION: { value: Contraception; label: string }[] = [
  { value: 'no', label: 'No' },
  { value: 'si', label: 'Sí' },
  { value: 'no_decir', label: 'Prefiero no decirlo' },
]

interface Props {
  email: string
  settings: CycleSettings
  periods: Period[]
  estimate: LengthEstimate
  avisos: AvisosBackend
  onSaveSettings: (settings: CycleSettings) => Promise<void>
  /** Returns how many periods were new. */
  onImport: (periods: Period[]) => Promise<number>
  onDeleteAccount: () => Promise<void>
  onSignOut: () => void
}

export function AjustesScreen({ email, settings, periods, estimate, avisos, onSaveSettings, onImport, onDeleteAccount, onSignOut }: Props) {
  const push = usePush(avisos)
  const [length, setLength] = useState<number | null>(settings.declaredLength)
  const [contraception, setContraception] = useState(settings.contraception)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [importMsg, setImportMsg] = useState<string | null>(null)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const dirty = length !== settings.declaredLength || contraception !== settings.contraception
  const value = length ?? DEFAULT_LENGTH

  async function save() {
    setSaving(true)
    setError(null)
    try {
      await onSaveSettings({ declaredLength: length, contraception })
      setSaved(true)
    } catch {
      setError('No se han guardado los cambios. Prueba otra vez.')
    } finally {
      setSaving(false)
    }
  }

  function download() {
    const blob = new Blob([buildExportFile(settings, periods, new Date())], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `gimme-gold-${today()}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  async function importFile(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    const data = parseExportFile(await file.text())
    if (!data) return setImportMsg('Ese archivo no es un archivo de Gimme Gold.')
    setBusy(true)
    try {
      const added = await onImport(data.periods)
      setImportMsg(added === 0 ? 'No había nada nuevo: ya tenías todas esas reglas.' : `¡Hecho! He añadido ${added} ${added === 1 ? 'regla' : 'reglas'}.`)
    } catch {
      setImportMsg('No he podido importarlo. Prueba otra vez.')
    } finally {
      setBusy(false)
    }
  }

  async function deleteAll() {
    setBusy(true)
    setError(null)
    try {
      await onDeleteAccount()
    } catch {
      setError('No he podido borrar la cuenta. Prueba otra vez.')
      setBusy(false)
    }
  }

  return (
    <main className="screen ajustes">
      <header className="historial__head">
        <Link to="/" className="historial__back" aria-label="Volver a Ciclo">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </Link>
        <h1>Ajustes</h1>
      </header>

      <section className="ajustes__section" aria-labelledby="ajustes-ciclo">
        <h2 id="ajustes-ciclo" className="eyebrow">
          Tu ciclo
        </h2>

        <div className="ajustes__field">
          <span className="alta__label">Duración habitual</span>
          <div className="stepper stepper--compact">
            <button type="button" aria-label="Un día menos" disabled={value <= MIN_LENGTH} onClick={() => (setLength(value - 1), setSaved(false))}>
              −
            </button>
            <output aria-live="polite">
              <strong>{length === null ? '¿?' : value}</strong> {length === null ? 'no lo sé' : 'días'}
            </output>
            <button type="button" aria-label="Un día más" disabled={value >= MAX_LENGTH} onClick={() => (setLength(value + 1), setSaved(false))}>
              +
            </button>
          </div>
          {length !== null && (
            <button type="button" className="alta__link" onClick={() => (setLength(null), setSaved(false))}>
              No lo sé
            </button>
          )}
          <p className="alta__hint">
            {estimate.source === 'historial'
              ? `Ahora calculo tu ciclo con tu historial: ${estimate.length} días. Esto solo cuenta mientras no haya historial suficiente.`
              : 'La uso hasta que hayas apuntado al menos dos reglas.'}
          </p>
        </div>

        <div className="ajustes__field">
          <span className="alta__label">Anticonceptivos hormonales</span>
          <div className="alta__options" role="radiogroup" aria-label="Anticonceptivos hormonales">
            {CONTRACEPTION.map((o) => (
              <button
                key={o.value}
                type="button"
                role="radio"
                aria-checked={contraception === o.value}
                className={`option${contraception === o.value ? ' is-on' : ''}`}
                onClick={() => (setContraception(o.value), setSaved(false))}
              >
                {o.label}
              </button>
            ))}
          </div>
          {contraception === 'si' && (
            <p className="alta__warn">Te enseñaré las fases como orientación y no verás ventana fértil.</p>
          )}
        </div>

        {(dirty || saved) && (
          <button type="button" className="btn btn--go" disabled={!dirty || saving} onClick={save}>
            {saved && !dirty ? 'Guardado' : 'Guardar cambios'}
          </button>
        )}
      </section>

      <section className="ajustes__section" aria-labelledby="ajustes-avisos">
        <h2 id="ajustes-avisos" className="eyebrow">
          Avisos
        </h2>
        <AvisosAjuste variant="ella" push={push} />
      </section>

      <section className="ajustes__section" aria-labelledby="ajustes-pareja">
        <h2 id="ajustes-pareja" className="eyebrow">
          Pareja
        </h2>
        <Link to="/compartir" className="ajustes__row">
          <span>Compartir con tu pareja</span>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M9 6l6 6-6 6" />
          </svg>
        </Link>
      </section>

      <section className="ajustes__section" aria-labelledby="ajustes-datos">
        <h2 id="ajustes-datos" className="eyebrow">
          Tus datos
        </h2>
        <button type="button" className="btn btn--ghost" onClick={download}>
          Descargar mis datos
        </button>
        <label className={`btn btn--ghost ajustes__file${busy ? ' is-busy' : ''}`}>
          Importar un archivo
          <input type="file" accept="application/json,.json" onChange={importFile} disabled={busy} />
        </label>
        <p className="alta__hint">Sirve el archivo que descargaste aquí o el de la versión anterior de Gimme Gold.</p>
        {importMsg && (
          <p className="ajustes__msg" role="status">
            {importMsg}
          </p>
        )}

        {confirmDelete ? (
          <div className="ajustes__danger" role="alert">
            <Billy mood="muerto" size={90} />
            <p>
              Si te vas, me hago el muerto de verdad. Se borran tu cuenta, tus reglas, tus notas y el enlace de tu pareja.{' '}
              <strong>No se puede deshacer.</strong>
            </p>
            <button type="button" className="btn ajustes__delete" disabled={busy} onClick={deleteAll}>
              Sí, borrar todo
            </button>
            <button type="button" className="alta__link" onClick={() => setConfirmDelete(false)}>
              Mejor no
            </button>
          </div>
        ) : (
          <button type="button" className="alta__link ajustes__danger-link" onClick={() => setConfirmDelete(true)}>
            Borrar mi cuenta y todos mis datos
          </button>
        )}
      </section>

      {error && <p className="alta__error">{error}</p>}

      <section className="ajustes__section" aria-labelledby="ajustes-sesion">
        <h2 id="ajustes-sesion" className="eyebrow">
          Sesión
        </h2>
        <p className="ajustes__email">
          Has entrado como <strong>{email}</strong>
        </p>
        <button type="button" className="btn btn--ghost" onClick={onSignOut}>
          Cerrar sesión
        </button>
      </section>

      <p className="alta__fine">
        {AVISO_NO_ANTICONCEPTIVO} Tus datos de salud se guardan en la UE y solo los ves tú. <Link to="/privacidad">Privacidad</Link>
      </p>
    </main>
  )
}
