// Notification copy. Draft from docs/textos-avisos.md: Alex calibrates the tone. Short: a notification
// shows one line of title and two of body on a lock screen. Nothing here may hint at fertility or at a
// late period on the partner's side (D10). Also used by api/avisos.ts, so no browser APIs.

import type { EventoElla } from '../domain/avisos'
import type { PartnerState } from '../domain/partner'

export interface AvisoCopy {
  title: string
  body: string
}

export const AVISOS_ELLA: Record<EventoElla, AvisoCopy> = {
  manifestacion: {
    title: 'Entras en Manifestación ✨',
    body: 'Energía, labia y ganas de todo. Si tienes algo que pedir, negociar o presentar, esta es tu semana.',
  },
  poder2: {
    title: 'Entras en Poder 2',
    body: 'Bajan las hormonas y sube el foco. Buena semana para cerrar cosas; menos buena para decidir a lo loco.',
  },
  mimos: {
    title: 'Empieza Mimos',
    body: 'Tu cuerpo pide calma, hidratos y agenda ligera. No es pereza, es progesterona.',
  },
  regla48: {
    title: 'La regla llega en unos dos días',
    body: 'Para que te organices: ibuprofeno, lo que necesites en el bolso y pocos planes. Yo ya me estoy haciendo el muerto.',
  },
}

export const AVISOS_PAREJA: Record<PartnerState, AvisoCopy> = {
  regla: {
    title: 'Día de recarga',
    body: 'Le ha venido la regla. Hoy: espacio, manta y cena hecha. Hazte el muerto, pero un muerto útil.',
  },
  poder1: {
    title: 'Vuelve la energía',
    body: 'Se abre la ventana de las conversaciones pendientes. Es ahora o dentro de tres semanas. Yo que tú, ahora.',
  },
  manifestacion: {
    title: 'Está en su mejor momento',
    body: 'Reserva para cenar fuera. Y quítate el chándal, que te he visto.',
  },
  poder2: {
    title: 'Bajón hormonal a la vista',
    body: 'Ni el tema del verano, ni el de tu madre, ni el de quién plancha. Yo he hecho testamento esta mañana.',
  },
  mimos: {
    title: 'Semana de mimos',
    body: 'Calma, hidratos y llevarle la razón un poquito más. No es manipulación, es supervivencia. La tuya.',
  },
  'codigo-rojo': {
    title: 'Código rojo',
    body: 'Faltan pocos días para la regla. Protocolo zarigüeya: manta, series y lo que ella elija. Chocolate en casa.',
  },
}
