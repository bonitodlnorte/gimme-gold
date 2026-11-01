// Partner view copy (D10). Draft from docs/textos-pareja.md: Alex calibrates the tone.

import type { PartnerState } from '../domain/partner'

export interface PartnerCopy {
  headline: string
  billy: string
  goodPlan: string[]
  avoid: string[]
}

export const PARA_PAREJA: Record<PartnerState, PartnerCopy> = {
  regla: {
    headline: 'Día de recarga',
    billy:
      'Empieza un ciclo nuevo y su cuerpo está en modo recarga. Hoy necesita espacio, calma y cero explicaciones. Tú haz lo que yo: hazte el muerto, pero un muerto útil que trae la manta, el ibuprofeno y la cena.',
    goodPlan: ['Cena en casa', 'Tú cocinas', 'Manta y series'],
    avoid: ['Planes con mucha gente', 'Temas pendientes', 'Preguntar «¿estás bien?» cada hora'],
  },
  poder1: {
    headline: 'Vuelve la energía',
    billy:
      '¡Buenas noticias, superviviente! Se abre la ventana de las conversaciones pendientes: hoy te escucha con calma y hasta puede que te dé la razón (no te acostumbres). Si tienes algo que hablar, es ahora o dentro de tres semanas. Yo que tú, ahora.',
    goodPlan: ['Hablar eso que tenéis pendiente', 'Hacer deporte juntos', 'Planes con amigos'],
    avoid: ['Dejar las conversaciones para la semana de Mimos (créeme)'],
  },
  manifestacion: {
    headline: 'Está en su mejor momento',
    billy:
      'Ojo, que esto se anima. Está con energía, con ganas de hablar y con ganas de todo. Hoy sí: reserva para cenar fuera. Y quítate el chándal, que te he visto.',
    goodPlan: ['Cena fuera', 'Escapada', 'Un plan que nunca habéis hecho'],
    avoid: ['Proponer otra vez el sofá. Ya habrá tiempo de sofá'],
  },
  poder2: {
    headline: 'Bajón hormonal a la vista',
    billy:
      'Las hormonas se han ido de vacaciones sin avisar. Hoy no saques el tema del verano, ni el de tu madre, ni el de quién plancha. Yo he hecho testamento esta mañana, por si acaso.',
    goodPlan: ['Deporte juntos', 'Plan tranquilo', 'Cocinar algo rico'],
    avoid: ['Decisiones gordas', 'Discusiones', 'Visita sorpresa de tu madre'],
  },
  mimos: {
    headline: 'Semana de mimos',
    billy:
      'Entramos en territorio Mimos. Necesita calma, hidratos y que le lleven la razón un poquito más de lo normal. No es manipulación, es supervivencia. La tuya.',
    goodPlan: ['Manta y series', 'Pedir algo de cenar', 'Masaje de pies, sin que te lo pida'],
    avoid: ['Planes con mucha gente', 'Sacar temas pendientes', 'Comentar lo que come'],
  },
  'codigo-rojo': {
    headline: 'Código rojo',
    billy:
      'Activa el protocolo zarigüeya: patas arriba, lengua fuera y ni un movimiento hasta nuevo aviso. Si te ve con vida, que sea trayendo chocolate. Plan de hoy: manta, series y lo que ella elija. Masaje de pies: si te lo pide, sí; si no te lo pide, también.',
    goodPlan: ['Lo que ella elija', 'Chocolate en casa', 'Dormir pronto'],
    avoid: ['Cualquier cosa que empiece por «tenemos que hablar»'],
  },
}

/** What to plan in each stretch ahead (Lo que viene). Concrete, bookable ideas. */
export const PLANES_PAREJA: Record<PartnerState, { titulo: string; ideas: string[] }> = {
  regla: { titulo: 'Día de recarga', ideas: ['Dale espacio', 'Cena en casa y cocinas tú', 'Ibuprofeno y chocolate a mano'] },
  poder1: { titulo: 'Vuelve la energía', ideas: ['Esa conversación pendiente', 'Deporte juntos', 'Plan con amigos'] },
  manifestacion: { titulo: 'Su mejor momento', ideas: ['Reserva una cena romántica', 'Escapada o plan nuevo', 'Fiesta con amigos'] },
  poder2: { titulo: 'Las hormonas bajan', ideas: ['Planes tranquilos', 'Cocinar algo rico juntos', 'Nada de decisiones gordas'] },
  mimos: { titulo: 'Semana de mimos', ideas: ['Noche de sofá y series', 'Flores o su capricho favorito', 'Masaje de pies'] },
  'codigo-rojo': { titulo: 'Código rojo', ideas: ['Llena la nevera de lo que le gusta', 'Plan en casa', 'Cero «tenemos que hablar»'] },
}

type Upcoming = 'regla' | 'manifestacion' | 'poder2' | 'mimos'

export function avisoProximo(to: Upcoming, inDays: number): string {
  const en = inDays === 1 ? 'Mañana' : `En ${inDays} días`
  switch (to) {
    case 'manifestacion':
      return `${en} empieza su mejor momento. Ve mirando restaurante.`
    case 'poder2':
      return `${en} bajan las hormonas. Si tienes algo que pedirle, date prisa.`
    case 'mimos':
      return `${en} empieza la semana de mimos. Ve llenando la nevera.`
    case 'regla':
      return inDays === 1
        ? 'La regla llega mañana, más o menos. Revisa que haya ibuprofeno en casa. Y chocolate.'
        : `La regla llega en unos ${inDays} días. Revisa que haya ibuprofeno en casa. Y chocolate.`
  }
}

export const AVISO_ORIENTATIVO_PAREJA =
  'Estas fases son una orientación: no todos los ciclos van como en el libro. Si dudas, pregúntale. Hablar sigue funcionando.'

export const ENLACE_NO_VALIDO = {
  headline: 'Este enlace ya no funciona',
  billy: 'Ha caducado o te lo han retirado. Yo no sé nada, yo solo pasaba por aquí. Pídele uno nuevo, con cariño.',
}
