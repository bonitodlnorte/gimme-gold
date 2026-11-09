// Which notification is due today (avisos). Both she and her partner have one "state key" per day;
// the daily cron (api/avisos.ts) compares it with the last key it notified and sends when it changed.
// Keys carry the cycle start, so a newly logged period always counts as a change, however late or
// early it came. Keys are also what the client stores when a device subscribes, so nobody receives
// a notification about the state they were already in.

import { type CycleStatus, type Phase } from './cycle'
import type { LocalDate } from './dates'
import { partnerStatus, type PartnerState } from './partner'

/** Days before the expected period at which she gets the heads-up. */
export const AVISO_REGLA_DIAS = 2

/** What she is told about. Poder 1 has no notification: she starts it herself by logging the period. */
export type EventoElla = Exclude<Phase, 'poder1'> | 'regla48'

export interface Aviso<E extends string> {
  key: string
  /** null: the state changed but there is nothing to say about it. */
  evento: E | null
}

/**
 * Her state today. The heads-up state absorbs the rest of the cycle, a late period included, so a
 * delay never turns back into "Mimos starts" and never produces a second heads-up.
 */
export function avisoElla(status: CycleStatus): Aviso<EventoElla> {
  const start = status.cycleStart
  if (status.cycleDay >= status.estimate.length - AVISO_REGLA_DIAS) {
    return { key: `regla48:${start}`, evento: 'regla48' }
  }
  const phase = status.phase
  return { key: `fase:${phase}:${start}`, evento: phase === 'poder1' ? null : phase }
}

/**
 * The partner's state today, from what partner_view() lets him see. While the period is late the state
 * stays "codigo-rojo" with the same key, so no notification can give the delay away (D10).
 */
export function avisoPareja(view: { cycleStart: LocalDate; cycleLength: number; orientative: boolean }, on: LocalDate): Aviso<PartnerState> {
  const state = partnerStatus(view, on).state
  return { key: `estado:${state}:${view.cycleStart}`, evento: state }
}
