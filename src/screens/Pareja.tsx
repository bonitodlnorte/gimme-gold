import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { Billy, type BillyMood } from '../components/Billy'
import { AVISO_ORIENTATIVO_PAREJA, ENLACE_NO_VALIDO, PARA_PAREJA, avisoProximo } from '../content/pareja'
import { PHASE_NAMES } from '../domain/cycle'
import { toJsDate, today } from '../domain/dates'
import { partnerStatus, type PartnerState } from '../domain/partner'
import { fetchPartnerView, type PartnerView } from '../data/store'
import './Ciclo.css'
import './Pareja.css'

// The partner's read-only page (D10), opened from the link she shares. No account needed.

const dateLabel = new Intl.DateTimeFormat('es-ES', { weekday: 'long', day: 'numeric', month: 'short' })
const weekday = new Intl.DateTimeFormat('es-ES', { weekday: 'narrow' })

const MOODS: Record<Exclude<PartnerState, 'codigo-rojo'>, BillyMood> = {
  regla: 'zen',
  poder1: 'normal',
  manifestacion: 'fiesta',
  poder2: 'alerta',
  mimos: 'muerto',
}

export function ParejaScreen() {
  const { token = '' } = useParams()
  const [view, setView] = useState<PartnerView | null | undefined>(undefined)
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    fetchPartnerView(token).then(setView, () => setFailed(true))
  }, [token])

  if (failed || view === null) {
    return (
      <main className="screen waiting">
        <Billy mood="desolado" size={120} />
        <h1 className="pareja__title">{failed ? 'No consigo cargar nada' : ENLACE_NO_VALIDO.headline}</h1>
        <p>{failed ? '¿Tienes conexión? Prueba a recargar.' : ENLACE_NO_VALIDO.billy}</p>
      </main>
    )
  }
  if (view === undefined) {
    return (
      <main className="screen waiting">
        <Billy mood="muerto" size={120} />
        <p>Billy está mirando el calendario…</p>
      </main>
    )
  }

  const status = partnerStatus(view, today())
  const copy = PARA_PAREJA[status.state]

  return (
    <main className="screen ciclo pareja" data-phase={status.phase}>
      <header className="ciclo__date">
        <p className="eyebrow">{dateLabel.format(toJsDate(today()))}</p>
        <h1>Cómo está ella hoy</h1>
      </header>

      <div className="ciclo__body">
        <div className="ciclo__col">
          <section className="ciclo__hero" aria-label={`Fase: ${PHASE_NAMES[status.phase]}`}>
            <div className="ciclo__hero-text">
              <span className="ciclo__phase">{PHASE_NAMES[status.phase]}</span>
              <p className="ciclo__headline">{copy.headline}</p>
            </div>
            {status.state !== 'codigo-rojo' && <Billy mood={MOODS[status.state]} size={96} />}
          </section>

          {status.state === 'codigo-rojo' && (
            <figure className="pareja__photo">
              <img src="/images/play-dead-animal.jpeg" alt="Una zarigüeya haciéndose la muerta" />
              <figcaption>Tú, hoy. Así.</figcaption>
            </figure>
          )}

          <p className="ciclo__billy">
            <span>Billy, tu coach de supervivencia</span>
            {copy.billy}
          </p>

          {status.upcoming && <p className="ciclo__note ciclo__note--info">{avisoProximo(status.upcoming.to, status.upcoming.inDays)}</p>}
          {status.orientative && <p className="ciclo__note ciclo__note--warn">{AVISO_ORIENTATIVO_PAREJA}</p>}
        </div>

        <div className="ciclo__col">
          <section>
            <h2 className="eyebrow">Buen plan</h2>
            <ul className="ciclo__chips">
              {copy.goodPlan.map((item) => (
                <li key={item} className="chip pareja__yes">
                  {item}
                </li>
              ))}
            </ul>
          </section>

          <section>
            <h2 className="eyebrow">Mejor no</h2>
            <ul className="ciclo__chips">
              {copy.avoid.map((item) => (
                <li key={item} className="chip pareja__no">
                  {item}
                </li>
              ))}
            </ul>
          </section>

          <section>
            <h2 className="eyebrow">Esta semana</h2>
            <ol className="ciclo__days">
              {status.days.map((day, i) => (
                <li
                  key={day.date}
                  data-phase={day.phase}
                  className={[i === 0 && 'is-today', day.predicted && 'is-uncertain'].filter(Boolean).join(' ')}
                  aria-label={`${dateLabel.format(toJsDate(day.date))}: ${PHASE_NAMES[day.phase]}${day.predicted ? ', estimado' : ''}`}
                >
                  {weekday.format(toJsDate(day.date)).toUpperCase()}
                </li>
              ))}
            </ol>
          </section>

          <p className="pareja__footer">Te lo ha compartido ella desde Gimme Gold, y puede retirarlo cuando quiera.</p>
        </div>
      </div>
    </main>
  )
}
