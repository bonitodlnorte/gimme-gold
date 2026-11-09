import { useEffect, useState } from 'react'
import { Billy } from './Billy'
import { onOldHost } from './Mudanza'
import { installed, platform } from '../lib/pwa'
import { supabase } from '../lib/supabase'
import '../screens/Alta.css'
import './Mudanza.css'

// Billy's invitation to turn notifications on, which means adding the app to the home screen: push only
// works from there on iPhone. Once the installed app opens, Avisos.tsx asks for the permission, so this is
// one flow, not two. iOS has no install prompt, so it shows the steps; Android Chrome fires
// beforeinstallprompt, which we keep to offer a one-tap install.

interface InstallPromptEvent extends Event {
  prompt: () => Promise<void>
}

// The event fires once, early in the page load, so it is captured at module load.
let deferredPrompt: InstallPromptEvent | null = null
const listeners = new Set<() => void>()
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault()
  deferredPrompt = e as InstallPromptEvent
  listeners.forEach((fn) => fn())
})

const DISMISSED_KEY = { ella: 'gimmeGold_instalarCerrado', pareja: 'gimmeGold_instalarParejaCerrado' }

const COPY = {
  ella: {
    title: 'Activa los avisos',
    text: 'Te aviso cuando cambies de fase y dos días antes de la regla. Para eso tengo que vivir en tu pantalla de inicio: añádeme y, al abrirme, te lo pido.',
  },
  pareja: {
    title: 'Que te avise yo',
    text: 'Un aviso cuando cambie la cosa y otro antes del código rojo, para que no te pille desprevenido. Guárdame en la pantalla de inicio y, al abrirme, te lo pido.',
  },
}

type Variant = keyof typeof COPY

function dismissed(variant: Variant): boolean {
  try {
    return window.localStorage.getItem(DISMISSED_KEY[variant]) === '1'
  } catch {
    return false
  }
}

function ShareIcon() {
  return (
    <svg className="instalar__share" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-label="Compartir">
      <path d="M12 3v12M7 8l5-5 5 5" />
      <path d="M5 12v7a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-7" />
    </svg>
  )
}

/** True when this page loaded with a hand-off manifest, so adding it now installs her app signed in (Traspaso.tsx). */
function prepared(): boolean {
  return document.querySelector('link[rel="manifest"]')?.getAttribute('href')?.startsWith('/instalar/') ?? false
}

/** Reloads on /instalar/<token>/ so the manifest carries a one-time sign-in for the installed app. False if it can't. */
async function prepare(): Promise<boolean> {
  const { data } = await supabase.auth.getSession()
  if (!data.session) return false
  try {
    const res = await fetch('/api/traspaso', { method: 'POST', headers: { authorization: `Bearer ${data.session.access_token}` } })
    const { token } = (await res.json()) as { token?: string }
    if (!res.ok || !token) return false
    window.location.assign(`/instalar/${encodeURIComponent(token)}/`)
    return true
  } catch {
    return false
  }
}

/** For the partner, the tip skips the sign-in part: his page needs no account. */
export function Instalar({ variant = 'ella' }: { variant?: Variant }) {
  const os = platform()
  const [hidden, setHidden] = useState(() => !os || installed() || dismissed(variant) || onOldHost())
  const [canPrompt, setCanPrompt] = useState(deferredPrompt !== null)
  // On iOS her app needs the sign-in handed over first; 'manual' when that failed and she signs in again instead.
  const [handoff, setHandoff] = useState<'todo' | 'busy' | 'ready' | 'manual'>(() =>
    variant === 'ella' && os === 'ios' ? (prepared() ? 'ready' : 'todo') : 'ready',
  )

  useEffect(() => {
    const update = () => setCanPrompt(deferredPrompt !== null)
    listeners.add(update)
    const done = () => setHidden(true)
    window.addEventListener('appinstalled', done)
    return () => {
      listeners.delete(update)
      window.removeEventListener('appinstalled', done)
    }
  }, [])

  if (hidden) return null

  function close() {
    try {
      window.localStorage.setItem(DISMISSED_KEY[variant], '1')
    } catch {
      // Private mode: it will show again next time, which is fine.
    }
    setHidden(true)
  }

  async function handOver() {
    setHandoff('busy')
    if (!(await prepare())) setHandoff('manual')
  }

  async function install() {
    await deferredPrompt?.prompt()
    deferredPrompt = null
    setCanPrompt(false)
  }

  return (
    <aside className="mudanza instalar" aria-label="Activar los avisos añadiendo la app a la pantalla de inicio">
      <Billy mood="fiesta" size={56} />
      <div>
        <p className="mudanza__title">{COPY[variant].title}</p>
        <p>{COPY[variant].text}</p>
        {os === 'ios' &&
          (handoff === 'todo' || handoff === 'busy' ? (
            <button type="button" className="btn btn--go mudanza__go" disabled={handoff === 'busy'} onClick={handOver}>
              Prepárame para el iPhone
            </button>
          ) : (
            <>
              <ol className="instalar__steps">
                <li>
                  Toca <ShareIcon /> <strong>Compartir</strong>.
                </li>
                <li>
                  Elige <strong>«Añadir a pantalla de inicio»</strong>.
                </li>
              </ol>
              {handoff === 'ready' && variant === 'ella' && (
                <p className="instalar__note">Entrarás sin volver a poner tu email si me añades en la próxima hora.</p>
              )}
              {handoff === 'manual' && (
                <p className="instalar__note">Al abrirme desde ahí tendrás que entrar una vez más con tu email: el iPhone guarda la sesión aparte.</p>
              )}
            </>
          ))}
        {os === 'android' &&
          (canPrompt ? (
            <button type="button" className="btn btn--go mudanza__go" onClick={install}>
              Instalar Gimme Gold
            </button>
          ) : (
            <p>
              Abre el menú <strong>⋮</strong> del navegador y elige <strong>«Instalar app»</strong> o{' '}
              <strong>«Añadir a pantalla de inicio»</strong>.
            </p>
          ))}
        <button type="button" className="alta__link instalar__close" onClick={close}>
          Ahora no
        </button>
      </div>
    </aside>
  )
}
