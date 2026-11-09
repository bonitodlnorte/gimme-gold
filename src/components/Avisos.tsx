import { useEffect, useMemo, useState } from 'react'
import { Billy } from './Billy'
import { Sheet } from './Sheet'
import { currentPush, pushPermission, pushSupported, subscribePush, unsubscribePush, type PushKeys } from '../lib/push'
import { installed } from '../lib/pwa'
import '../screens/Alta.css'
import './Avisos.css'

// Notifications (avisos), for her and for the partner. The web invites to "activate notifications" and
// that leads to installing the app (Instalar.tsx); once the installed app opens, Billy asks for the
// permission with one tap here (AvisosPrompt). AvisosAjuste is the switch in Ajustes and on the partner page.

export type PushState = 'cargando' | 'no-disponible' | 'denegado' | 'off' | 'on'

/** How a device is saved for her (RLS) or for the partner (RPC by token). */
export interface AvisosBackend {
  /** Today's state key, stored with a new subscription so nothing already current gets announced. */
  lastKey: string
  /** False when the backend will not take it (a revoked partner link, say). */
  save: (keys: PushKeys) => Promise<boolean>
  remove: (endpoint: string) => Promise<void>
  /** Whether a subscription the browser has is also known to the backend; absent means trust the browser. */
  known?: (endpoint: string) => Promise<boolean>
}

export interface Push {
  state: PushState
  /** What went wrong the last time activating failed, in the browser's words. Shown small, to diagnose a phone. */
  error: string | null
  activate: () => Promise<'on' | 'denegado' | 'error'>
  deactivate: () => Promise<void>
}

function describe(e: unknown): string {
  if (e instanceof Error) return `${e.name}: ${e.message}`
  return String(e)
}

/** In development, ?avisos=1 shows the prompt as if the app were installed with notifications off. */
function forced(): boolean {
  return import.meta.env.DEV && new URLSearchParams(window.location.search).get('avisos') === '1'
}

export function usePush(backend: AvisosBackend): Push {
  const [state, setState] = useState<PushState>('cargando')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let live = true
    async function look() {
      if (forced()) return setState('off')
      if (!pushSupported()) return setState('no-disponible')
      if (pushPermission() === 'denied') return setState('denegado')
      const keys = await currentPush()
      if (!keys) return setState('off')
      // The browser remembers a subscription the backend may have lost (a reinstall, a new link): save it again.
      if (backend.known && !(await backend.known(keys.endpoint).catch(() => true))) await backend.save(keys).catch(() => false)
      setState('on')
    }
    look().then(
      () => undefined,
      () => live && setState('off'),
    )
    return () => {
      live = false
    }
    // Looking once is enough: activate/deactivate keep the state from then on.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return useMemo<Push>(
    () => ({
      state,
      error,
      async activate() {
        setError(null)
        try {
          const keys = await subscribePush()
          if (!keys) {
            setState('denegado')
            return 'denegado'
          }
          if (!(await backend.save(keys))) {
            setError('El servidor no ha aceptado este dispositivo: puede que el enlace ya no sea válido.')
            return 'error'
          }
          setState('on')
          return 'on'
        } catch (e) {
          setError(describe(e))
          return 'error'
        }
      },
      async deactivate() {
        try {
          const endpoint = await unsubscribePush()
          if (endpoint) await backend.remove(endpoint)
        } finally {
          setState('off')
        }
      },
    }),
    [state, error, backend],
  )
}

type Variant = 'ella' | 'pareja'

const PROMPT = {
  ella: {
    title: '¿Te aviso?',
    text: 'Te mando un aviso cuando cambies de fase y otro dos días antes de la regla, para que te organices. Nada más: ni recordatorios pesados ni mensajes a deshora.',
    go: 'Sí, avísame',
  },
  pareja: {
    title: '¿Te aviso yo?',
    text: 'Te mando un aviso cuando cambie la cosa: cuando vuelve la energía, cuando está en su mejor momento y cuando toca código rojo. Para que no te pille desprevenido.',
    go: 'Sí, avísame',
  },
}

const SNOOZE_KEY = { ella: 'gimmeGold_avisosLuego', pareja: 'gimmeGold_avisosLuegoPareja' }
const SNOOZE_DAYS = 14

function snoozed(variant: Variant): boolean {
  try {
    const until = Number(window.localStorage.getItem(SNOOZE_KEY[variant]) ?? 0)
    return Date.now() < until
  } catch {
    return false
  }
}

function snooze(variant: Variant) {
  try {
    window.localStorage.setItem(SNOOZE_KEY[variant], String(Date.now() + SNOOZE_DAYS * 86_400_000))
  } catch {
    // Private mode: it will ask again next time, which is fine.
  }
}

/** Billy asks for the permission the first time the installed app opens without notifications. */
export function AvisosPrompt({ variant, push }: { variant: Variant; push: Push }) {
  const [open, setOpen] = useState(() => (installed() || forced()) && !snoozed(variant))
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState(false)

  if (!open || push.state !== 'off') return null
  const copy = PROMPT[variant]

  async function go() {
    setBusy(true)
    setError(false)
    const result = await push.activate()
    setBusy(false)
    if (result === 'error') return setError(true)
    setOpen(false)
  }

  function later() {
    snooze(variant)
    setOpen(false)
  }

  return (
    <Sheet label={copy.title} onClose={later}>
      <div className="avisos">
        <Billy mood="alerta" size={110} />
        <h2 className="avisos__title">{copy.title}</h2>
        <p>{copy.text}</p>
        {error && (
          <p className="alta__error">
            No he podido activarlos. Inténtalo otra vez, o más tarde desde Ajustes.
            {push.error && <small className="avisos__detalle">{push.error}</small>}
          </p>
        )}
        <button type="button" className="btn btn--go" disabled={busy} onClick={go}>
          {copy.go}
        </button>
        <button type="button" className="alta__link" onClick={later}>
          Ahora no
        </button>
      </div>
    </Sheet>
  )
}

/** The switch: in Ajustes for her, at the bottom of the partner page for him. Renders nothing outside the installed app. */
export function AvisosAjuste({ variant, push }: { variant: Variant; push: Push }) {
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState(false)
  const inApp = installed() || forced()

  if (push.state === 'cargando') return null
  if (!inApp || push.state === 'no-disponible') {
    // Installing is the way in; the Instalar card already says so where it shows.
    return variant === 'ella' ? <p className="alta__hint">Para avisarte tengo que estar en tu pantalla de inicio. Añádeme desde Hoy.</p> : null
  }

  async function toggle() {
    setBusy(true)
    setError(false)
    if (push.state === 'on') await push.deactivate()
    else if ((await push.activate()) === 'error') setError(true)
    setBusy(false)
  }

  if (push.state === 'denegado') {
    return (
      <p className="alta__hint">
        Los avisos están bloqueados en el teléfono. Para activarlos, ve a los ajustes del sistema, busca {variant === 'ella' ? 'Gimme Gold' : 'Billy'} y
        permite las notificaciones.
      </p>
    )
  }

  const on = push.state === 'on'
  return (
    <div className="avisos__ajuste">
      <p className="alta__hint">
        {on
          ? variant === 'ella'
            ? 'Te aviso cuando cambies de fase y dos días antes de la regla.'
            : 'Te aviso cuando cambie la cosa y antes del código rojo.'
          : variant === 'ella'
            ? 'Un aviso al cambiar de fase y otro dos días antes de la regla.'
            : 'Un aviso cuando cambie la cosa y otro antes del código rojo.'}
      </p>
      <button type="button" className={`btn ${on ? 'btn--ghost' : 'btn--go'}`} disabled={busy} onClick={toggle}>
        {on ? 'Desactivar los avisos' : 'Activar los avisos'}
      </button>
      {error && (
        <p className="alta__error">
          No he podido activarlos. Inténtalo otra vez.
          {push.error && <small className="avisos__detalle">{push.error}</small>}
        </p>
      )}
    </div>
  )
}
