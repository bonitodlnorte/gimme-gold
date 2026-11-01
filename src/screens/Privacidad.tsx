import { useNavigate } from 'react-router-dom'
import { ACTUALIZADA, SECCIONES } from '../content/privacidad'
import './Historial.css'
import './Aprender.css'

// Public page (no account needed): linked from the login, the consent step and Ajustes.

export function PrivacidadScreen() {
  const navigate = useNavigate()
  return (
    <main className="screen aprender">
      <header className="historial__head">
        <button type="button" className="historial__back" aria-label="Volver" onClick={() => (window.history.length > 1 ? navigate(-1) : navigate('/'))}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </button>
        <h1>Privacidad</h1>
      </header>
      <p className="aprender__lead">
        Tus datos de salud son tuyos. Aquí te contamos, sin letra pequeña, qué guardamos y por qué. Actualizada el {ACTUALIZADA}.
      </p>
      {SECCIONES.map((s) => (
        <section key={s.titulo} className="aprender__block">
          <h2 className="eyebrow">{s.titulo}</h2>
          {s.parrafos.map((p) => (
            <p key={p} className="aprender__p">
              {p}
            </p>
          ))}
        </section>
      ))}
    </main>
  )
}
