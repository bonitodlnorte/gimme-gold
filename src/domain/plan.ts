// Plan (D23): six months of predicted phases and periods, and which days suit each goal.
// Each cycle further away adds uncertainty, so the margin around predicted periods grows
// with the square root of the number of cycles ahead (independent cycle-to-cycle variation).

import {
  DEFAULT_PERIOD_DAYS,
  MAX_LENGTH,
  ovulationDay,
  sortedStarts,
  phaseForCycleDay,
  type CycleStatus,
  type Period,
  type Phase,
} from './cycle'
import { addDays, daysBetween, type LocalDate } from './dates'

/** About six months (D24). */
export const HORIZON_DAYS = 183

/** Period days are their own state: the recharge (docs/textos-billy.md). */
export type DayState = 'recarga' | Phase

/** en_curso: her period now; probable: predicted period days; posible: within the margin around them. */
export type PeriodChance = 'en_curso' | 'probable' | 'posible' | null

export interface ForecastDay {
  date: LocalDate
  /** 0 for the current cycle, 1 for the next one, and so on. */
  cycleIndex: number
  cycleDay: number
  phase: Phase
  state: DayState
  period: PeriodChance
  confidence: 'alta' | 'media' | 'baja'
}

export interface Forecast {
  days: ForecastDay[]
  cycleLength: number
  periodDays: number
  /** The period is late, so everything after today is a rough guess until she logs it. */
  late: boolean
}

function median(values: number[]): number {
  const sorted = [...values].sort((a, b) => a - b)
  const mid = Math.floor(sorted.length / 2)
  return sorted.length % 2 === 1 ? sorted[mid]! : Math.round((sorted[mid - 1]! + sorted[mid]!) / 2)
}

/** How many days her period usually lasts, from the ends she logged. */
export function typicalPeriodDays(periods: Period[]): number {
  const lengths = periods
    .filter((p) => p.end)
    .map((p) => daysBetween(p.start, p.end!) + 1)
    .filter((n) => n >= 2 && n <= 10)
  return lengths.length > 0 ? median(lengths) : DEFAULT_PERIOD_DAYS
}

export function forecast(status: CycleStatus, periods: Period[], horizon = HORIZON_DAYS): Forecast {
  const length = status.estimate.length
  const periodDays = typicalPeriodDays(periods)
  const late = status.daysLate > 0
  const baseMargin = daysBetween(status.nextPeriod.expected, status.nextPeriod.latest)
  // When late, assume the period could start any day now: the next cycle starts tomorrow.
  const nextStart = late ? addDays(status.date, 1) : status.nextPeriod.expected
  const marginFor = (k: number) => (k === 0 ? 0 : Math.ceil(baseMargin * Math.sqrt(k)) + (late ? 3 : 0))
  const startOf = (k: number) => addDays(nextStart, (k - 1) * length)

  const days: ForecastDay[] = []
  for (let i = 0; i < horizon; i++) {
    const date = addDays(status.date, i)
    let k: number
    let cycleDay: number
    if (date < nextStart) {
      k = 0
      cycleDay = status.cycleDay + i
    } else {
      const offset = daysBetween(nextStart, date)
      k = 1 + Math.floor(offset / length)
      cycleDay = (offset % length) + 1
    }

    const phase: Phase = k === 0 && late ? 'mimos' : phaseForCycleDay(Math.min(cycleDay, length), length)

    let period: PeriodChance = null
    const inCurrentPeriod = status.periodEnd
      ? date <= status.periodEnd
      : cycleDay <= Math.max(periodDays, status.cycleDay)
    if (k === 0 && status.periodOngoing && inCurrentPeriod) {
      period = 'en_curso'
    } else if (k >= 1 && cycleDay <= periodDays) {
      period = 'probable'
    } else {
      // Within the margin of the nearest predicted start (this cycle's next one, or the one after).
      for (const j of [k, k + 1]) {
        if (j < 1) continue
        const d = daysBetween(startOf(j), date)
        const m = marginFor(j)
        if (d >= -m && d < periodDays + m) period = 'posible'
      }
    }

    const margin = marginFor(k)
    days.push({
      date,
      cycleIndex: k,
      cycleDay,
      phase,
      state: period === 'en_curso' || period === 'probable' ? 'recarga' : phase,
      period,
      confidence: k === 0 ? 'alta' : margin <= 3 ? 'media' : 'baja',
    })
  }
  return { days, cycleLength: length, periodDays, late }
}

/** A day that already happened (D27): what she logged, with the phases around it. */
export interface PastDay {
  date: LocalDate
  cycleDay: number
  phase: Phase
  state: DayState
  /** Inside a period she logged (its end, when not logged, is her usual length). */
  period: boolean
  /** The real length of a closed cycle; the estimate for the current one. */
  cycleLength: number
  /** In the current cycle while the period is late: phases there are only a guess, so no 🔥. */
  guess: boolean
}

/**
 * Days from `from` to the day before `status.date`. A closed cycle uses its real length, so
 * ovulation is counted back from the period that followed: better than a prediction. Days
 * before her first logged period, or in a gap too long to be a cycle (a missed log), are left out.
 */
export function pastDays(status: CycleStatus, periods: Period[], from: LocalDate): PastDay[] {
  const starts = sortedStarts(periods)
  const ends = new Map(periods.map((p) => [p.start, p.end ?? null]))
  const usual = typicalPeriodDays(periods)
  const days: PastDay[] = []
  for (let date = from; date < status.date; date = addDays(date, 1)) {
    let i = starts.length - 1
    while (i >= 0 && starts[i]! > date) i--
    if (i < 0) continue
    const start = starts[i]!
    const next = starts[i + 1]
    const length = next && next <= status.date ? daysBetween(start, next) : status.estimate.length
    if (length > MAX_LENGTH && next) continue
    const cycleDay = daysBetween(start, date) + 1
    const phase = phaseForCycleDay(Math.min(cycleDay, length), length)
    const end = ends.get(start)
    // The period running today, without an end yet, covers every day since it started.
    const ongoing = start === status.cycleStart && status.periodOngoing
    const period = end ? date <= end : ongoing || cycleDay <= usual
    const guess = start === status.cycleStart && status.daysLate > 0
    days.push({ date, cycleDay, phase, state: period ? 'recarga' : phase, period, cycleLength: length, guess })
  }
  return days
}

export type GoalId = 'entrenar' | 'competir' | 'conversacion' | 'decidir' | 'conectar' | 'descansar' | 'viaje'

/** Whether a day suits a goal, after Pelz (docs/research/mindy-pelz-doac-ciclo.md). */
/** What `suits` needs from a day: a forecast one, or a past one (D27), whose period is what she logged. */
type GoalDay = Pick<ForecastDay, 'state' | 'phase' | 'cycleDay'> & { period: PeriodChance | boolean }

export function suits(day: GoalDay, goal: GoalId, cycleLength: number): boolean {
  const o = ovulationDay(cycleLength)
  const energetic = day.state !== 'recarga' && day.phase !== 'mimos' && day.cycleDay >= 3
  switch (goal) {
    case 'entrenar':
      return energetic
    case 'competir':
      return energetic && !day.period
    case 'conversacion':
      // Days 2–12 of a 28-day cycle: from day 2 to two days before ovulation.
      return day.phase !== 'mimos' && day.cycleDay >= 2 && day.cycleDay <= o - 2
    case 'decidir':
      return day.phase === 'manifestacion' || (day.phase === 'poder1' && day.state !== 'recarga' && day.cycleDay >= 3)
    case 'conectar':
      return day.phase === 'manifestacion' || (day.phase === 'poder1' && day.cycleDay >= o - 6)
    case 'descansar':
      return day.state === 'recarga' || day.phase === 'mimos'
    case 'viaje':
      return !day.period
  }
}

/**
 * "On fire": the days around ovulation, when libido and fertility both peak (all of Manifestación,
 * as the partner sees it). One mark instead of separate libido, fertile and ovulation emojis.
 * An estimate, never contraception.
 */
export function onFire(day: { phase: Phase }): boolean {
  return day.phase === 'manifestacion'
}

/** Runs of consecutive days that suit a goal. */
export function goalWindows(fc: Forecast, goal: GoalId): { from: LocalDate; to: LocalDate }[] {
  const windows: { from: LocalDate; to: LocalDate }[] = []
  for (const day of fc.days) {
    if (!suits(day, goal, fc.cycleLength)) continue
    const last = windows[windows.length - 1]
    if (last && daysBetween(last.to, day.date) === 1) last.to = day.date
    else windows.push({ from: day.date, to: day.date })
  }
  return windows
}

/** The next start of each phase (and of the predicted period) after today. */
export function upcomingChanges(fc: Forecast, count = 3): { state: DayState; date: LocalDate; period: PeriodChance }[] {
  const changes: { state: DayState; date: LocalDate; period: PeriodChance }[] = []
  for (let i = 1; i < fc.days.length && changes.length < count; i++) {
    const prev = fc.days[i - 1]!
    const day = fc.days[i]!
    if (day.state !== prev.state) changes.push({ state: day.state, date: day.date, period: day.period })
  }
  return changes
}
