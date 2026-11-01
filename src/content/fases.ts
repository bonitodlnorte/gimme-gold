// User-facing copy per phase, kept out of the components (decision D6).
// Draft texts from docs/textos-billy.md and the design canvas: Alex calibrates the tone.

import type { Phase } from '../domain/cycle'

export interface PhaseCopy {
  headline: string
  billy: string
  goodFor: string[]
}

/** Her view. The first days of Poder 1 have their own copy (the period has just arrived). */
export const PARA_ELLA: Record<Phase | 'regla', PhaseCopy> = {
  regla: {
    headline: 'Modo recarga',
    billy:
      'Arranca un ciclo nuevo y tu cuerpo está en modo recarga. Eso merece trato VIP: manta, algo calentito y el móvil en silencio. En casa ya están avisados: hoy no se negocia nada.',
    goodFor: ['Manta', 'Algo calentito', 'Paseo suave'],
  },
  poder1: {
    headline: 'Vuelve la energía',
    billy:
      'Se abre la ventana de las conversaciones difíciles, y dura toda esta fase. Si tienes algo pendiente que hablar, este es el momento. Yo aprovecho para salir de debajo del sofá.',
    goodFor: ['Conversaciones pendientes', 'Entreno fuerte', 'Planes con gente'],
  },
  manifestacion: {
    headline: 'Estás en tu mejor momento',
    billy: 'Estás en tu mejor momento y yo me desmayo de la emoción. Aprovecha para lanzar eso que llevas semanas rumiando.',
    goodFor: ['Cena fuera', 'Entreno fuerte', 'Lanzar proyecto'],
  },
  poder2: {
    headline: 'Bajón hormonal a la vista',
    billy:
      'Las hormonas se han ido de vacaciones sin avisar. Hoy mejor no decidir nada gordo ni discutir con nadie. Yo me escondo en el armario, por si acaso.',
    goodFor: ['Entreno fuerte, todavía', 'Plan tranquilo', 'Cero discusiones'],
  },
  mimos: {
    headline: 'Semana antes de la regla',
    billy:
      'Hoy ni ayuno ni entreno a muerte: tu cuerpo pide hidratos y sofá, y yo le doy la razón. Si alguien te lleva la contraria, me avisas y me desmayo encima de él.',
    goodFor: ['Hidratos', 'Sofá y series', 'Dormir pronto'],
  },
}

export const DATO_FERTIL = 'Estás en tu ventana fértil. Si no buscas embarazo, usa protección.'

export const AVISO_ORIENTATIVO = {
  anticonceptivos:
    'Con la mayoría de anticonceptivos hormonales no hay ovulación natural. Las fases son una orientación: puede que no reflejen lo que sientes.',
  irregular: 'Tus ciclos varían bastante, así que las fases y la próxima regla son una estimación con mucho margen.',
}

export const AVISO_NO_ANTICONCEPTIVO = 'Gimme Gold no es un método anticonceptivo.'
