import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { Billy } from '../components/Billy'
import { Mudanza } from '../components/Mudanza'
import { supabase } from '../lib/supabase'
import { Progress } from './Alta'
import './Alta.css'

// Step 1 of the sign-up (D13, D18): a 6-digit code by email, no passwords and no magic link.
// The same screen signs in returning users; Supabase creates the account on first use.

function authErrorText(error: { message: string; status?: number }): string {
  if (error.status === 429) return 'Demasiados intentos. Espera un minuto y vuelve a probar.'
  if (/expired|invalid/i.test(error.message)) return 'Ese código no vale o ha caducado. Pide otro.'
  return 'Algo ha fallado. Prueba otra vez.'
}

export function LoginScreen() {
  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')
  const [sentTo, setSentTo] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function sendCode(e: FormEvent) {
    e.preventDefault()
    setBusy(true)
    setError(null)
    const address = email.trim().toLowerCase()
    const { error } = await supabase.auth.signInWithOtp({ email: address, options: { shouldCreateUser: true } })
    setBusy(false)
    if (error) return setError(authErrorText(error))
    setSentTo(address)
    setCode('')
  }

  async function verify(e: FormEvent) {
    e.preventDefault()
    if (!sentTo) return
    setBusy(true)
    setError(null)
    const { error } = await supabase.auth.verifyOtp({ email: sentTo, token: code, type: 'email' })
    setBusy(false)
    // On success the session listener in App moves on to the next step.
    if (error) setError(authErrorText(error))
  }

  return (
    <main className="screen alta">
      <Progress step={1} />
      <Mudanza signedIn={false} />

      <div className="alta__billy">
        <Billy mood={sentTo ? 'normal' : 'muerto'} size={120} />
        <p className="alta__bubble">
          {sentTo ? (
            <>
              Te he mandado un código a <strong>{sentTo}</strong>. Míralo, que no muerde.
            </>
          ) : (
            'Hola, soy Billy, zarigüeya y experto mundial en hacerme el muerto: cuando la cosa se pone fea, me tumbo patas arriba y aquí no ha pasado nada. Te voy a ayudar a entender tu ciclo y a que en casa también lo entiendan… y sepan cuándo hacerse el muerto como yo.'
          )}
        </p>
      </div>

      {sentTo ? (
        <form className="alta__form" onSubmit={verify}>
          <label className="alta__label" htmlFor="code">
            Código
          </label>
          <input
            id="code"
            className="field field--code"
            inputMode="numeric"
            autoComplete="one-time-code"
            pattern="[0-9]*"
            maxLength={8}
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
            autoFocus
            required
          />
          {error && <p className="alta__error">{error}</p>}
          <button type="submit" className="btn btn--go" disabled={busy || code.length < 6}>
            Entrar
          </button>
          <button type="button" className="alta__link" onClick={() => setSentTo(null)}>
            Cambiar email o pedir otro código
          </button>
        </form>
      ) : (
        <form className="alta__form" onSubmit={sendCode}>
          <label className="alta__label" htmlFor="email">
            Tu email
          </label>
          <input
            id="email"
            className="field"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          {error && <p className="alta__error">{error}</p>}
          <button type="submit" className="btn btn--go" disabled={busy}>
            Envíame el código
          </button>
          <p className="alta__hint">Te mandamos un código de 6 cifras. Sin contraseñas.</p>
        </form>
      )}

      <p className="alta__fine">
        <strong>Tus datos de salud se guardan en la UE y solo los ves tú.</strong> <Link to="/privacidad">Privacidad</Link>
      </p>
    </main>
  )
}
