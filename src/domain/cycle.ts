// Cycle engine. Decisions D11, D12 and D14 in docs/definicion-funcional.md:
// - phases are anchored to the estimated ovulation (cycle length − 14);
// - the cycle length is the median of the last 6 completed cycles;
// - with hormonal contraception phases are shown with a warning and no fertile window.

import { addDays, daysBetween, type LocalDate } from './dates'

export type Phase = 'poder1' | 'manifestacion' | 'poder2' | 'mimos'
export type Contraception = 'no' | 'si' | 'no_decir'

export interface Period {
  start: LocalDate
  end?: LocalDate | null
  note?: string | null
}

export interface CycleSettings {
  declaredLength: number | null
  contraception: Contraception
}

export const DEFAULT_LENGTH = 28
export const MIN_LENGTH = 21
export const MAX_LENGTH = 45
export const LENGTHS_WINDOW = 6
/** Spread between the shortest and longest recent cycle above which the cycle counts as irregular. */
export const IRREGULAR_SPREAD = 7
export const DEFAULT_PERIOD_DAYS = 5
const LUTEAL_DAYS = 14

export const PHASE_NAMES: Record<Phase, string> = {
  poder1: 'Poder 1',
  manifestacion: 'Manifestación',
  poder2: 'Poder 2',
  mimos: 'Mimos',
}

/** A cycle length outside the normal range usually means a period was not logged. */
export function isSuspiciousLength(length: number): boolean {
  return length < MIN_LENGTH || length > MAX_LENGTH
}

/** Period start dates, unique and oldest first. */
export function sortedStarts(periods: Period[]): LocalDate[] {
  return [...new Set(periods.map((p) => p.start))].sort()
}

/** Lengths of completed cycles, most recent first. */
export function completedCycleLengths(periods: Period[]): number[] {
  const starts = sortedStarts(periods)
  const lengths: number[] = []
  for (let i = starts.length - 1; i > 0; i--) {
    lengths.push(daysBetween(starts[i - 1]!, starts[i]!))
  }
  return lengths
}

function median(values: number[]): number {
  const sorted = [...values].sort((a, b) => a - b)
  const mid = Math.floor(sorted.length / 2)
  return sorted.length % 2 === 1 ? sorted[mid]! : Math.round((sorted[mid - 1]! + sorted[mid]!) / 2)
}

export interface LengthEstimate {
  length: number
  source: 'historial' | 'declarada' | 'por_defecto'
  /** Number of completed cycles behind the estimate. */
  basedOn: number
  /** Longest minus shortest of those cycles; null with fewer than two. */
  spread: number | null
  irregular: boolean
}

export function estimateCycleLength(periods: Period[], declaredLength: number | null): LengthEstimate {
  const recent = completedCycleLengths(periods)
    .filter((n) => !isSuspiciousLength(n))
    .slice(0, LENGTHS_WINDOW)

  if (recent.length === 0) {
    const declared = declaredLength !== null && !isSuspiciousLength(declaredLength) ? declaredLength : null
    return {
      length: declared ?? DEFAULT_LENGTH,
      source: declared !== null ? 'declarada' : 'por_defecto',
      basedOn: 0,
      spread: null,
      irregular: false,
    }
  }

  const spread = recent.length >= 2 ? Math.max(...recent) - Math.min(...recent) : null
  return {
    length: median(recent),
    source: 'historial',
    basedOn: recent.length,
    spread,
    irregular: spread !== null && spread > IRREGULAR_SPREAD,
  }
}

function clampLength(length: number): number {
  return Math.min(MAX_LENGTH, Math.max(MIN_LENGTH, length))
}

export function ovulationDay(length: number): number {
  return clampLength(length) - LUTEAL_DAYS
}

/** Phase for a day (1-based) of a cycle of the given length. */
export function phaseForCycleDay(day: number, length: number): Phase {
  const o = ovulationDay(length)
  if (day <= o - 4) return 'poder1'
  if (day <= o + 1) return 'manifestacion'
  if (day <= o + 5) return 'poder2'
  return 'mimos'
}

/** First and last cycle day of each phase for a cycle of the given length. */
export function phaseRanges(length: number): Record<Phase, { from: number; to: number }> {
  const o = ovulationDay(length)
  return {
    poder1: { from: 1, to: o - 4 },
    manifestacion: { from: o - 3, to: o + 1 },
    poder2: { from: o + 2, to: o + 5 },
    mimos: { from: o + 6, to: clampLength(length) },
  }
}

/** Cycle days of the estimated fertile window: five days before ovulation to the day after. */
export function fertileWindow(length: number): { from: number; to: number } {
  const o = ovulationDay(length)
  return { from: Math.max(1, o - 5), to: o + 1 }
}

export interface CycleStatus {
  date: LocalDate
  cycleStart: LocalDate
  cycleDay: number
  phase: Phase
  estimate: LengthEstimate
  /** Days past the expected start of the next period; 0 when not late. */
  daysLate: number
  periodOngoing: boolean
  /** She already logged the last day of the current period. */
  periodEndLogged: boolean
  /** null when the fertile window is not shown (hormonal contraception or late period). */
  fertile: boolean | null
  nextPeriod: { expected: LocalDate; earliest: LocalDate; latest: LocalDate }
  /** Phases are orientative: hormonal contraception or an irregular cycle. */
  showWarning: boolean
}

function nextPeriodMargin(estimate: LengthEstimate): number {
  if (estimate.spread === null) return 3
  return Math.max(2, Math.ceil(estimate.spread / 2))
}

export function cycleStatus(periods: Period[], settings: CycleSettings, on: LocalDate): CycleStatus | null {
  const current = [...periods]
    .filter((p) => p.start <= on)
    .sort((a, b) => (a.start < b.start ? 1 : -1))[0]
  if (!current) return null

  const estimate = estimateCycleLength(periods, settings.declaredLength)
  const length = estimate.length
  const cycleDay = daysBetween(current.start, on) + 1
  const daysLate = Math.max(0, cycleDay - length)
  const margin = nextPeriodMargin(estimate)
  const expected = addDays(current.start, length)

  const periodOngoing = current.end ? on <= current.end : cycleDay <= DEFAULT_PERIOD_DAYS

  let fertile: boolean | null = null
  if (settings.contraception !== 'si' && daysLate === 0) {
    const window = fertileWindow(length)
    fertile = cycleDay >= window.from && cycleDay <= window.to
  }

  return {
    date: on,
    cycleStart: current.start,
    cycleDay,
    phase: daysLate > 0 ? 'mimos' : phaseForCycleDay(cycleDay, length),
    estimate,
    daysLate,
    periodOngoing,
    periodEndLogged: Boolean(current.end),
    fertile,
    nextPeriod: { expected, earliest: addDays(expected, -margin), latest: addDays(expected, margin) },
    showWarning: settings.contraception === 'si' || estimate.irregular,
  }
}

export interface ProjectedDay {
  date: LocalDate
  cycleDay: number
  phase: Phase
  /** Falls on or after the earliest expected start of the next period. */
  uncertain: boolean
}

/** Phases for `days` consecutive days starting at `status.date`, rolling into the next predicted cycle. */
export function projectDays(status: CycleStatus, days: number): ProjectedDay[] {
  const length = status.estimate.length
  const result: ProjectedDay[] = []
  for (let i = 0; i < days; i++) {
    const date = addDays(status.date, i)
    const rawDay = status.cycleDay + i
    const late = status.daysLate > 0
    // A late cycle stays in Mimos until a period is logged.
    const cycleDay = late ? rawDay : ((rawDay - 1) % length) + 1
    result.push({
      date,
      cycleDay,
      phase: late ? 'mimos' : phaseForCycleDay(cycleDay, length),
      uncertain: date >= status.nextPeriod.earliest,
    })
  }
  return result
}
