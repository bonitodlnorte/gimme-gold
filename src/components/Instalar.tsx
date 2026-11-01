import { useEffect, useState } from 'react'
import { Billy } from './Billy'
import { onOldHost } from './Mudanza'
import '../screens/Alta.css'
import './Mudanza.css'

// Billy's tip to add the app to the home screen. iOS has no install prompt, so it shows the
// steps; Android Chrome fires beforeinstallprompt, which we keep to offer a one-tap install.

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

const DISMISSED_KEY = 'gimmeGold_instalarCerrado'

function dismissed(): boolean {
  try {
    return window.localStorage.getItem(DISMISSED_KEY) === '1'
  } catch {
    return false
  }
}

function installed(): boolean {
  return window.matchMedia('(display-mode: standalone)').matches || (navigator as { standalone?: boolean }).standalone === true
}

/** 'ios', 'android' or null on desktop. In development, ?instalar=ios|android previews it. */
function platform(): 'ios' | 'android' | null {
  const forced = import.meta.env.DEV ? new URLSearchParams(window.location.search).get('instalar') : null
  if (forced === 'ios' || forced === 'android') return forced
  const ua = navigator.userAgent
  // iPadOS reports itself as a Mac, but with touch.
  if (/iPhone|iPad|iPod/.test(ua) || (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1)) return 'ios'
  if (/Android/.test(ua)) return 'android'
  return null
}

function ShareIcon() {
  return (
    <svg className="instalar__share" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-label="Compartir">
      <path d="M12 3v12M7 8l5-5 5 5" />
      <path d="M5 12v7a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-7" />
    </svg>
  )
}

export function Instalar() {
  const os = platform()
  const [hidden, setHidden] = useState(() => !os || installed() || dismissed() || onOldHost())
  const [canPrompt, setCanPrompt] = useState(deferredPrompt !== null)

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
      window.localStorage.setItem(DISMISSED_KEY, '1')
    } catch {
      // Private mode: it will show again next time, which is fine.
    }
    setHidden(true)
  }

  async function install() {
    await deferredPrompt?.prompt()
    deferredPrompt = null
    setCanPrompt(false)
  }

  return (
    <aside className="mudanza instalar" aria-label="Añadir Gimme Gold a la pantalla de inicio">
      <Billy mood="fiesta" size={56} />
      <div>
        <p className="mudanza__title">Llévame en el bolsillo</p>
        <p>Añádeme a tu pantalla de inicio y me abrirás como una app. Prometo no hacerme el muerto cuando me necesites.</p>
        {os === 'ios' && (
          <>
            <ol className="instalar__steps">
              <li>
                Toca <ShareIcon /> <strong>Compartir</strong>.
              </li>
              <li>
                Elige <strong>«Añadir a pantalla de inicio»</strong>.
              </li>
            </ol>
            <p className="instalar__note">Al abrirme desde ahí tendrás que entrar una vez más con tu email: el iPhone guarda la sesión aparte.</p>
          </>
        )}
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
