// Aprender (D16): the four phases after Mindy Pelz (docs/research/mindy-pelz-doac-ciclo.md),
// plus fertility and hormonal contraception. Health information is never obscured (D7): each
// sheet says plainly what the evidence does not back. Alex calibrates the tone.

import type { Phase } from '../domain/cycle'

export interface FichaFase {
  /** One line for the list. */
  resumen: string
  hormonas: string
  teSientes: string
  teConviene: { tema: string; texto: string }[]
  pareja: string
  /** What the evidence does not back, or when to see a doctor. */
  ojo: string[]
}

export const FICHAS_FASE: Record<Phase, FichaFase> = {
  poder1: {
    resumen: 'Sube el estrógeno. Buen momento para hablar de lo difícil.',
    hormonas:
      'Empieza con la regla. Los primeros días las hormonas están bajas y, a partir del día 3 más o menos, el estrógeno empieza a subir. Con estrógeno se aguanta mejor el estrés.',
    teSientes:
      'Los días 1 y 2 puede que necesites espacio y descanso. Después llegan la claridad mental y las ganas de hablar y de ver gente.',
    teConviene: [
      { tema: 'Conversaciones', texto: 'Desde el día 2 hasta el final de esta fase tienes la mejor ventana para resolver conflictos y hablar de lo pendiente.' },
      { tema: 'Trabajo', texto: 'Buen momento para planificar y para todo lo que pida cabeza.' },
      { tema: 'Ejercicio', texto: 'Ve subiendo la intensidad a medida que vuelve la energía.' },
      { tema: 'Comida', texto: 'Pelz recomienda menos hidratos en la primera mitad del ciclo.' },
    ],
    pareja: 'Días 1 y 2: darle espacio. Después, buen momento para salir y para hablar de lo pendiente.',
    ojo: [
      'Lo de comer menos hidratos según la fase es una recomendación de Pelz con poca evidencia detrás. Si te sienta bien, adelante; si no, no pasa nada.',
      'Si la regla te duele tanto que no puedes hacer vida normal, o sangras muchísimo, consúltalo con tu médica. Puede haber causas como endometriosis o miomas que conviene descartar.',
    ],
  },
  manifestacion: {
    resumen: 'Ovulación. Energía, libido y creatividad a tope.',
    hormonas:
      'El estrógeno llega a su pico y ovulas, unos 14 días antes de tu próxima regla. La testosterona también sube un poco.',
    teSientes: 'Muchas mujeres notan más energía, más libido y más ganas de hablar y de conectar.',
    teConviene: [
      { tema: 'Proyectos', texto: 'Pelz dice que es su momento más creativo: buen momento para lanzar algo nuevo o ponerse a escribir.' },
      { tema: 'Planes', texto: 'Cenas, planes nuevos, gente.' },
      { tema: 'Ejercicio', texto: 'Tienes energía para entrenar fuerte.' },
    ],
    pareja: 'Su mejor momento para planes fuera y para conectar.',
    ojo: [
      'Estos días coinciden casi siempre con tu ventana fértil. Si no buscas embarazo, usa protección: Gimme Gold no es un método anticonceptivo.',
      'Lo de la libido tiene cierto respaldo, pero cambia mucho de una mujer a otra.',
    ],
  },
  poder2: {
    resumen: 'Bajón hormonal. Mejor sin discusiones.',
    hormonas: 'Después de ovular, el estrógeno cae de golpe y la progesterona empieza a subir.',
    teSientes: 'Puede que notes un bajón de ánimo o más irritabilidad, aunque todavía tengas fuerza para trabajar y entrenar.',
    teConviene: [
      { tema: 'Trabajo', texto: 'Puedes seguir a buen ritmo. Pelz dice que se puede ir a tope hasta el final de esta fase.' },
      { tema: 'Conversaciones', texto: 'Mejor no sacar conflictos estos días. Guárdalos para el próximo Poder 1.' },
      { tema: 'Cuidarte', texto: 'Sé amable contigo si el ánimo baja. Es química, no eres tú.' },
    ],
    pareja: 'Bajón hormonal: amabilidad extra y nada de discusiones.',
    ojo: ['Es la fase de la que Pelz habla menos. Tómalo como orientación.'],
  },
  mimos: {
    resumen: 'Semana antes de la regla. Ni ayunos ni entrenos a muerte.',
    hormonas:
      'La progesterona está en su punto más alto y hacia el final bajan las dos hormonas, hasta que llega la regla. Con progesterona se tolera peor el estrés.',
    teSientes: 'Más casera, más sensible al estrés, quizá hinchada o con antojos de hidratos. Es normal.',
    teConviene: [
      { tema: 'Comida', texto: 'Hidratos naturales como fruta, patata o calabaza. Los antojos no son falta de voluntad.' },
      { tema: 'Ayuno', texto: 'Pelz recomienda no ayunar esta semana.' },
      { tema: 'Ejercicio', texto: 'Mejor yoga, caminar o fuerza suave que preparar un maratón.' },
      { tema: 'Descanso', texto: 'Prioriza dormir y, si puedes, baja la carga de trabajo.' },
    ],
    pareja: 'Mimos, calma y nada de conflictos grandes.',
    ojo: [
      'Lo de no ayunar no está probado con ensayos. Lo que sí se sabe es que comer poco y entrenar mucho durante mucho tiempo puede alterar el ciclo.',
      'Si el síndrome premenstrual te cambia mucho el ánimo o la vida, coméntalo con tu médica: tiene tratamiento.',
    ],
  },
}

export interface FichaExtra {
  titulo: string
  resumen: string
  parrafos: string[]
}

export const FICHA_FERTIL: FichaExtra = {
  titulo: 'Tu ventana fértil',
  resumen: 'Cuándo te puedes quedar embarazada, y por qué la app solo lo estima.',
  parrafos: [
    'La ventana fértil son unos 6 días: los 5 anteriores a la ovulación y el propio día de la ovulación. Dura tanto porque los espermatozoides pueden sobrevivir hasta 5 días.',
    'Gimme Gold la estima a partir de la duración de tu ciclo, contando que ovulas unos 14 días antes de la siguiente regla. Pero la ovulación se puede adelantar o retrasar cualquier mes, y más aún si tus ciclos varían.',
    'Por eso es solo una estimación. Gimme Gold no es un método anticonceptivo: no la uses para evitar un embarazo. Tu pareja no ve tu ventana fértil.',
  ],
}

export const FICHA_ANTICONCEPTIVOS: FichaExtra = {
  titulo: 'Si tomas anticonceptivos hormonales',
  resumen: 'Qué cambia en tus fases con la píldora, el anillo, el DIU hormonal o el implante.',
  parrafos: [
    'Con anticonceptivos hormonales combinados (píldora, anillo o parche) no hay ovulación ni las subidas y bajadas hormonales que describe Pelz. El sangrado de la semana de descanso no es una regla como tal.',
    'Con el DIU hormonal muchas mujeres siguen ovulando. Con el implante, normalmente no.',
    'Por eso Gimme Gold te enseña las fases solo como orientación y sin ventana fértil. Si las notas, aprovéchalas. Si no, no te preocupes: no es que lo estés haciendo mal.',
  ],
}

export const FUENTE = {
  titulo: 'La fuente: Mindy Pelz en Diary of a CEO',
  detalle: 'El tramo del ciclo, desde el minuto 1:09:59',
  url: 'https://www.youtube.com/watch?v=e2mQOGzHtQc&t=4199s',
}
