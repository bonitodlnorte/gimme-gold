import { useEffect, useState } from 'react'
import { Instalar } from '../components/Instalar'
import { useParams } from 'react-router-dom'
import { Billy, type BillyMood } from '../components/Billy'
import { AVISO_ORIENTATIVO_PAREJA, ENLACE_NO_VALIDO, PARA_PAREJA, PLANES_PAREJA, avisoProximo } from '../content/pareja'
import { toJsDate, today } from '../domain/dates'
import { partnerStatus, type PartnerSegment, type PartnerState } from '../domain/partner'
import { fetchPartnerView, type PartnerView } from '../data/store'
import './Ciclo.css'
import './Pareja.css'

// The partner's read-only page (D10), opened from the link she shares. No account needed.

const dateLabel = new Intl.DateTimeFormat('es-ES', { weekday: 'long', day: 'numeric', month: 'short' })
const dayMonth = new Intl.DateTimeFormat('es-ES', { weekday: 'short', day: 'numeric', month: 'short' })
const dayOnly = new Intl.DateTimeFormat('es-ES', { day: 'numeric' })
const dayShortMonth = new Intl.DateTimeFormat('es-ES', { day: 'numeric', month: 'short' })

const fmt = (f: Intl.DateTimeFormat, d: string) => f.format(toJsDate(d)).replace('.', '')

/** Short ranges that scan in a list: "6–9 nov", "30 nov – 3 dic", "jue 5 nov". */
function whenText(seg: PartnerSegment): string {
  if (seg.open) return `Desde el ${fmt(dayMonth, seg.from)}`
  if (seg.from === seg.to) return fmt(dayMonth, seg.from)
  if (seg.from.slice(0, 7) === seg.to.slice(0, 7)) return `${fmt(dayOnly, seg.from)}–${fmt(dayShortMonth, seg.to)}`
  return `${fmt(dayShortMonth, seg.from)} – ${fmt(dayShortMonth, seg.to)}`
}

// What Billy suggests he does, not how she is (her avatars come from moodFor).
const MOODS: Record<Exclude<PartnerState, 'codigo-rojo'>, BillyMood> = {
  regla: 'mayordomo',
  poder1: 'escucha',
  manifestacion: 'elegante',
  poder2: 'artificiero',
  mimos: 'bandera',
}

export function ParejaScreen() {
  const { token = '' } = useParams()
  const [view, setView] = useState<PartnerView | null | undefined>(undefined)
  const [failed, setFailed] = useState(false)
  const [showAll, setShowAll] = useState(false)

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
  // How long today's moment lasts: more useful to him than Pelz's phase name, and never "Poder 1" on period days.
  const now = status.ahead[0]?.current ? status.ahead[0] : null
  const lasts = now ? `Hasta el ${fmt(dayMonth, now.to)}` : 'Hoy es el último día'
  // The moment he is in is already at the top; the list starts with what changes next, one cycle ahead.
  const coming = status.ahead.filter((seg) => !seg.current)
  const cycleEnd = coming.findIndex((seg, i) => i > 0 && seg.state === coming[0]?.state)
  const shown = showAll || cycleEnd < 0 ? coming : coming.slice(0, cycleEnd)
  // On fire, with no legend: whoever wants to get it, gets it. Not when phases are only orientative.
  const fire = (state: string) => (state === 'manifestacion' && !status.orientative ? ' 🔥' : '')

  return (
    <main className="screen ciclo pareja" data-phase={status.phase}>
      <header className="ciclo__date">
        <p className="eyebrow">{dateLabel.format(toJsDate(today()))}</p>
        <h1>Cómo está ella hoy</h1>
      </header>

      <div className="ciclo__body">
        <div className="ciclo__col">
          <section className="ciclo__hero" aria-label={`Hoy: ${copy.headline}. ${lasts}`}>
            <div className="ciclo__hero-text">
              <span className="ciclo__phase">
                {lasts}
                {fire(status.state)}
              </span>
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
            <h2 className="eyebrow">Lo que viene</h2>
            <p className="pareja__lead">Para que lo planees con tiempo.</p>
            <ol className="pareja__ahead">
              {shown.map((seg) => (
                <li key={seg.from} data-phase={seg.phase} data-state={seg.state}>
                  <span className="pareja__when">
                    {whenText(seg)}
                    {seg.estimated && ' (aprox.)'}
                  </span>
                  <span className="pareja__what">
                    {PLANES_PAREJA[seg.state].titulo}
                    {fire(seg.state)}
                  </span>
                  <span className="pareja__ideas">{PLANES_PAREJA[seg.state].ideas.join(' · ')}</span>
                </li>
              ))}
            </ol>
            {shown.length < coming.length && (
              <button type="button" className="btn btn--ghost pareja__more" onClick={() => setShowAll(true)}>
                Ver las semanas siguientes
              </button>
            )}
          </section>

          <Instalar variant="pareja" />

          <p className="pareja__footer">Te lo ha compartido ella desde Gimme Gold, y puede retirarlo cuando quiera.</p>
        </div>
      </div>
    </main>
  )
}
