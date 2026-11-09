// What the partner link shows (D10, docs/textos-pareja.md). It works only from what partner_view()
// returns: the cycle start, the estimated length and whether phases are orientative. It never
// reveals fertility or a late period.

import { phaseForCycleDay, type Phase } from './cycle.js'
import { addDays, daysBetween, type LocalDate } from './dates.js'

/** Phases plus the first days of the period and the countdown at the end of Mimos. */
export type PartnerState = 'regla' | Phase | 'codigo-rojo'

/** Pelz: give her space on days 1–2. */
export const PARTNER_PERIOD_DAYS = 2
/** The last days before the expected period are the countdown. */
export const COUNTDOWN_DAYS = 3
/** How far ahead the "what's coming" notice looks. */
export const UPCOMING_WINDOW = 3

/** How far ahead the partner can plan: about six weeks. */
export const PLAN_AHEAD_DAYS = 42

/** A run of days in the same state, for planning ahead. */
export interface PartnerSegment {
  state: PartnerState
  phase: Phase
  from: LocalDate
  to: LocalDate
  /** Continues today's state. */
  current: boolean
  /** Falls in a predicted cycle, not the current one. */
  estimated: boolean
  /** Runs past the planning horizon. */
  open: boolean
}

export interface PartnerStatus {
  state: PartnerState
  phase: Phase
  /** The next change within UPCOMING_WINDOW days; null when there is none or the period is late. */
  upcoming: { to: 'regla' | Exclude<Phase, 'poder1'>; inDays: number } | null
  /** What's coming, by segments. When late, it reads like the last countdown day, so it cannot give the delay away. */
  ahead: PartnerSegment[]
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

  const ahead: PartnerSegment[] = []
  {
    // A late cycle is shown as if today were its last day: the next one starts tomorrow.
    const fromDay = late ? length : cycleDay
    for (let i = 1; i <= PLAN_AHEAD_DAYS; i++) {
      const day = fromDay + i
      const inCycle = ((day - 1) % length) + 1
      const dayState = stateFor(inCycle, length)
      const date = addDays(on, i)
      const last = ahead[ahead.length - 1]
      if (last && last.state === dayState && inCycle !== 1) {
        last.to = date
        continue
      }
      ahead.push({
        state: dayState,
        phase: phaseForCycleDay(inCycle, length),
        from: date,
        to: date,
        current: i === 1 && dayState === state,
        estimated: late || day > length,
        open: false,
      })
    }
    const last = ahead[ahead.length - 1]
    if (last) last.open = true
  }

  return { state, phase, upcoming, ahead, orientative: view.orientative }
}
