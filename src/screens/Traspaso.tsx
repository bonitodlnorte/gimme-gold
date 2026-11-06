import { useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Billy } from '../components/Billy'
import { supabase } from '../lib/supabase'

// The start of her app installed on an iPhone: /instalar/<token>/ (see api/traspaso.ts). The first launch has no session
// yet, because iOS keeps the installed app's storage apart from Safari's, so it redeems the token for one. Every launch
// comes through here, but once signed in it goes straight on; in Safari, where she prepared it, the token stays unused.
// If the token has expired she lands on the sign-in, as she would without it.

export function TraspasoScreen() {
  const { token = '' } = useParams()
  const navigate = useNavigate()

  useEffect(() => {
    let live = true
    supabase.auth
      .getSession()
      .then(({ data }) => (data.session ? null : supabase.auth.verifyOtp({ token_hash: token, type: 'email' })))
      .catch(() => null)
      .then(() => {
        if (live) navigate('/', { replace: true })
      })
    return () => {
      live = false
    }
  }, [token, navigate])

  return (
    <main className="screen waiting">
      <Billy mood="muerto" size={120} />
      <p>Despertando a Billy…</p>
    </main>
  )
}
