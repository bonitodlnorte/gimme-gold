// Plan copy (D23). Draft: Alex calibrates the tone.

import { PHASE_NAMES } from '../domain/cycle'
import type { DayState, GoalId } from '../domain/plan'

export const STATE_NAMES: Record<DayState, string> = { recarga: 'Recarga', ...PHASE_NAMES }

export const OBJETIVOS: { id: GoalId; label: string; why: string }[] = [
  { id: 'entrenar', label: 'Entrenar fuerte', why: 'Con el estrógeno arriba hay más energía para apretar. Mejor no en recarga ni en Mimos.' },
  { id: 'competir', label: 'Competir o un examen', why: 'Días con energía y sin regla prevista.' },
  { id: 'conversacion', label: 'Una conversación difícil', why: 'Pelz: del día 2 hasta poco antes de ovular es cuando mejor se gestionan los conflictos.' },
  { id: 'decidir', label: 'Decidir o lanzar algo', why: 'Claridad en Poder 1 y creatividad a tope en Manifestación.' },
  { id: 'conectar', label: 'Salir y conectar', why: 'Alrededor de la ovulación: ganas de gente, de hablar y de fiesta.' },
  { id: 'descansar', label: 'Descansar y reflexionar', why: 'Recarga y Mimos: el cuerpo pide calma, sofá y pensar.' },
  { id: 'viaje', label: 'Un viaje sin regla', why: 'Días en los que no se espera la regla, ni siquiera con margen.' },
]

/** Billy's advice for a date she has planned, by the state it falls in. */
export const CONSEJO_FECHA: Record<DayState, string> = {
  recarga:
    'Te pilla en modo recarga. Si es una competición, lleva todo lo necesario para la regla y no te exijas una marca personal. Si es un viaje, planes tranquilos. Si puedes moverla, yo la movería.',
  poder1:
    'Buena fecha: el estrógeno está subiendo y llega la energía. Ideal para algo que pida cabeza o esfuerzo.',
  manifestacion:
    'Fecha estelar: es tu mejor momento de energía y ganas de gente. Si es para lucirte, no podías elegir mejor.',
  poder2:
    'Todavía tienes fuerza, pero las hormonas empiezan a bajar. Prepárala con tiempo y no dejes nada para el último día.',
  mimos:
    'Te pilla en Mimos. Se puede, pero sin exigirte de más: duerme bien antes, come hidratos y deja hueco para descansar después.',
}

export const AVISO_PLAN =
  'Es una guía, no una norma: la ciencia dice que la fase influye poco en el rendimiento y cambia mucho de una persona a otra. Cuanto más lejos, menos fiable.'

export const AVISO_RETRASO = 'Tu regla se está retrasando, así que el calendario es aproximado hasta que la apuntes.'
