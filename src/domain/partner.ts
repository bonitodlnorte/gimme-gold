// What the partner link shows (D10, docs/textos-pareja.md). It works only from what partner_view()
// returns: the cycle start, the estimated length and whether phases are orientative. It never
// reveals fertility or a late period.

import { phaseForCycleDay, type Phase } from './cycle'
import { addDays, daysBetween, type LocalDate } from './dates'

/** Phases plus the first days of the period and the countdown at the end of Mimos. */
export type PartnerState = 'regla' | Phase | 'codigo-rojo'

/** Pelz: give her space on days 1–2. */
export const PARTNER_PERIOD_DAYS = 2
/** The last days before the expected period are the countdown. */
export const COUNTDOWN_DAYS = 3
/** How far ahead the "what's coming" notice looks. */
export const UPCOMING_WINDOW = 3

export interface PartnerDay {
  date: LocalDate
  phase: Phase
  /** In the next predicted cycle, so only an estimate. */
  predicted: boolean
}

export interface PartnerStatus {
  state: PartnerState
  phase: Phase
  /** The next change within UPCOMING_WINDOW days; null when there is none or the period is late. */
  upcoming: { to: 'regla' | Exclude<Phase, 'poder1'>; inDays: number } | null
  days: PartnerDay[]
  orientative: boolean
}

function stateFor(cycleDay: number, length: number): PartnerState {
  if (cycleDay > length - COUNTDOWN_DAYS) return 'codigo-rojo'
  if (cycleDay <= PARTNER_PERIOD_DAYS) return 'regla'
  return phaseForCycleDay(cycleDay, length)
}

export function partnerStatus(
  view: { cycleStart: LocalDate; cycleLength: number; orientative: boolean },
  on: LocalDate,
  days = 7,
): PartnerStatus {
  const length = view.cycleLength
  const cycleDay = daysBetween(view.cycleStart, on) + 1
  // Late: stay in the countdown with no day count, so the partner cannot tell (docs/textos-pareja.md).
  const late = cycleDay > length

  const phase = late ? 'mimos' : phaseForCycleDay(cycleDay, length)
  const state = late ? 'codigo-rojo' : stateFor(cycleDay, length)

  let upcoming: PartnerStatus['upcoming'] = null
  if (!late) {
    for (let i = 1; i <= UPCOMING_WINDOW; i++) {
      const day = cycleDay + i
      if (day > length) {
        upcoming = { to: 'regla', inDays: i }
        break
      }
      const next = phaseForCycleDay(day, length)
      if (next !== phase && next !== 'poder1') {
        upcoming = { to: next, inDays: i }
        break
      }
    }
  }

  const strip: PartnerDay[] = []
  for (let i = 0; i < days; i++) {
    const day = cycleDay + i
    const predicted = late || day > length
    strip.push({
      date: addDays(on, i),
      phase: late ? 'mimos' : phaseForCycleDay(((day - 1) % length) + 1, length),
      predicted,
    })
  }

  return { state, phase, upcoming, days: strip, orientative: view.orientative }
}
