import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Billy } from '../components/Billy'
import { createPartnerLink, loadPartnerLink, revokePartnerLinks, type PartnerLink } from '../data/store'
import './Alta.css'
import './Historial.css'
import './Compartir.css'

// G-Compartir: one partner link at a time. Only its hash is stored, so the link itself can only be
// shared right after creating it; sharing again creates a new one and the old one stops working.

const longDate = new Intl.DateTimeFormat('es-ES', { day: 'numeric', month: 'long' })

async function share(url: string): Promise<'shared' | 'copied' | 'cancelled'> {
  const data = { title: 'Gimme Gold', text: 'Billy tiene algo que contarte.', url }
  if (navigator.share && navigator.canShare?.(data)) {
    try {
      await navigator.share(data)
      return 'shared'
    } catch {
      return 'cancelled'
    }
  }
  await navigator.clipboard.writeText(url)
  return 'copied'
}

export function CompartirScreen({ userId }: { userId: string }) {
  const [link, setLink] = useState<PartnerLink | null | undefined>(undefined)
  const [fresh, setFresh] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [busy, setBusy] = useState(false)
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    loadPartnerLink(userId).then(setLink, () => setFailed(true))
  }, [userId])

  async function run(action: () => Promise<void>) {
    setBusy(true)
    setFailed(false)
    try {
      await action()
    } catch {
      setFailed(true)
    } finally {
      setBusy(false)
    }
  }

  const createAndShare = () =>
    run(async () => {
      const token = await createPartnerLink(userId)
      const url = `${window.location.origin}/pareja/${token}`
      setFresh(url)
      setLink(await loadPartnerLink(userId))
      setCopied((await share(url)) === 'copied')
    })

  const revoke = () =>
    run(async () => {
      await revokePartnerLinks(userId)
      setLink(null)
      setFresh(null)
    })

  return (
    <main className="screen compartir">
      <header className="historial__head">
        <Link to="/" className="historial__back" aria-label="Volver a Ciclo">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </Link>
        <h1>Tu pareja</h1>
      </header>

      <div className="compartir__billy">
        <Billy mood="alerta" size={110} />
        <p className="alta__bubble">Mándale este enlace y yo me encargo de entrenarle. Sin cuenta, sin contraseñas, sin excusas.</p>
      </div>

      <dl className="compartir__what">
        <dt>Qué verá</dt>
        <dd>Cómo estás hoy, planes que te encajan y lo que viene estos días.</dd>
        <dt>Qué no verá</dt>
        <dd>Tu ventana fértil, tus notas, tu historial ni si se te retrasa la regla.</dd>
      </dl>

      {failed && <p className="alta__error">Algo ha fallado. Prueba otra vez.</p>}

      {fresh && (
        <div className="compartir__fresh">
          <p>
            {copied ? '¡Copiado! Pégaselo por donde habléis.' : 'Este es el enlace. Guárdalo bien: no te lo puedo volver a enseñar.'}
          </p>
          <input readOnly value={fresh} onFocus={(e) => e.currentTarget.select()} aria-label="Enlace para tu pareja" />
          <button type="button" className="alta__link" onClick={async () => setCopied((await share(fresh)) === 'copied')}>
            Compartir otra vez
          </button>
        </div>
      )}

      <div className="compartir__actions">
        {link === undefined ? null : link ? (
          <>
            <div className="compartir__active">
              <span>
                <strong>Enlace activo</strong>
                <span>Caduca el {longDate.format(new Date(link.expiresAt))}</span>
              </span>
              <span className="compartir__dot" aria-hidden="true" />
            </div>
            {!fresh && (
              <button type="button" className="btn btn--go" disabled={busy} onClick={createAndShare}>
                Crear enlace nuevo
              </button>
            )}
            <button type="button" className="btn btn--ghost" disabled={busy} onClick={revoke}>
              Revocar acceso
            </button>
            {!fresh && <p className="alta__hint">Si creas uno nuevo, el anterior deja de funcionar.</p>}
          </>
        ) : (
          <button type="button" className="btn btn--go" disabled={busy} onClick={createAndShare}>
            Compartir enlace
          </button>
        )}
      </div>
    </main>
  )
}
