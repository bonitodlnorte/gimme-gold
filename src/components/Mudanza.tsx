import { readLegacyStorage } from '../domain/legacyImport'
import { Billy } from './Billy'
import './Mudanza.css'

// The app moves from gimme-gold.vercel.app to billy.korokota.com. The old address must keep
// working until current users have signed in there once: the old app's data lives in that
// origin's localStorage, so only there can it be imported into their account (D4).

const OLD_HOST = 'gimme-gold.vercel.app'
export const NEW_URL = 'https://billy.korokota.com'

/** True on the old address. In development, add ?mudanza to the URL to preview the notice. */
export function onOldHost(): boolean {
  if (import.meta.env.DEV && new URLSearchParams(window.location.search).has('mudanza')) return true
  return window.location.hostname === OLD_HOST
}

export function Mudanza({ signedIn }: { signedIn: boolean }) {
  if (!onOldHost()) return null
  const hasLegacy = !signedIn && Boolean(readLegacyStorage(window.localStorage)?.periods.length)

  return (
    <aside className="mudanza" aria-label="Gimme Gold se ha mudado">
      <Billy mood="fiesta" size={56} />
      <div>
        <p className="mudanza__title">¡Me he mudado a billy.korokota.com!</p>
        {hasLegacy ? (
          <p>Antes de irte, entra aquí con tu email: así me llevo tus reglas antiguas a tu cuenta. Luego te espero en la casa nueva.</p>
        ) : (
          <>
            <p>
              {signedIn
                ? 'Tus datos ya están en tu cuenta: entra allí con el mismo email y lo verás todo igual. Si me tenías en la pantalla de inicio, añádeme otra vez desde la dirección nueva.'
                : 'Entra allí con tu email.'}
            </p>
            <a className="btn btn--go mudanza__go" href={NEW_URL}>
              Ir a billy.korokota.com
            </a>
          </>
        )}
      </div>
    </aside>
  )
}
