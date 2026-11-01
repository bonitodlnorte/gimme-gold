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
      'Arranca un ciclo nuevo y tu cuerpo está en modo recarga. Eso merece trato VIP: manta, algo calentito y el móvil en silencio. Al resto del mundo ya le he dicho que estás en una reunión muy importante contigo misma.',
    goodFor: ['Manta', 'Algo calentito', 'Paseo suave'],
  },
  poder1: {
    headline: 'Vuelve la energía',
    billy:
      'Vuelve el estrógeno y vuelves tú, en modo dragón. ¿Esa conversación que llevas semanas guardándote? Ahora: hoy argumentas como una abogada de serie americana. Yo voy saliendo de debajo del sofá… despacito.',
    goodFor: ['Conversaciones pendientes', 'Entreno fuerte', 'Planes con gente'],
  },
  manifestacion: {
    headline: 'Estás en tu mejor momento',
    billy: '¡Alerta de purpurina! Estás en tu mejor momento: brillas, convences y te ríes de tus propios chistes (y son buenos). Lanza el proyecto, pide el aumento, organiza la cena.',
    goodFor: ['Cena fuera', 'Entreno fuerte', 'Lanzar proyecto'],
  },
  poder2: {
    headline: 'Bajón hormonal a la vista',
    billy:
      'Las hormonas se han ido de vacaciones sin avisar. Puede que hoy todo te irrite un poco más, yo incluido. Decisiones gordas, al congelador. Yo me escondo en el armario con un táper y una linterna, por si esto va para largo.',
    goodFor: ['Entreno fuerte, todavía', 'Plan tranquilo', 'Cero discusiones'],
  },
  mimos: {
    headline: 'Semana antes de la regla',
    billy:
      'Semana de mimos. Tu cuerpo pide hidratos, sofá y cero dramas ajenos (los míos no cuentan). Ni ayunos ni entrenos a muerte: aquí el único que se hace el muerto soy yo. Y si alguien te lleva la contraria, me avisas y me desmayo encima de él.',
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
