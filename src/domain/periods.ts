// Checks for adding or editing one period in the history (D14, D15).

import { isSuspiciousLength, MIN_LENGTH, type Period } from './cycle'
import { daysBetween, type LocalDate } from './dates'

export type PeriodError = 'futuro' | 'duplicada' | 'fin_antes' | 'fin_futuro'

export interface PeriodCheck {
  error: PeriodError | null
  /** Days to the nearest other period start when that gap is under MIN_LENGTH: probably a mistake. */
  tooCloseDays: number | null
}

/**
 * `editing` is the start date of the period being edited, so it is not compared with itself.
 */
export function checkPeriod(periods: Period[], candidate: Period, on: LocalDate, editing?: LocalDate): PeriodCheck {
  const others = periods.filter((p) => p.start !== editing)
  let error: PeriodError | null = null
  if (candidate.start > on) error = 'futuro'
  else if (others.some((p) => p.start === candidate.start)) error = 'duplicada'
  else if (candidate.end && candidate.end < candidate.start) error = 'fin_antes'
  else if (candidate.end && candidate.end > on) error = 'fin_futuro'

  const gaps = others.map((p) => Math.abs(daysBetween(p.start, candidate.start))).filter((d) => d > 0)
  const nearest = gaps.length > 0 ? Math.min(...gaps) : null
  return { error, tooCloseDays: nearest !== null && nearest < MIN_LENGTH ? nearest : null }
}

export interface HistoryRow {
  period: Period
  /** Days until the next period starts; null for the current cycle. */
  cycleLength: number | null
  /** Period length in days, counting both ends; null when the end was not logged. */
  periodDays: number | null
  /** The gap to the next period is out of range: a period was probably not logged (D14). */
  suspicious: boolean
}

/** History rows, most recent first. */
export function historyRows(periods: Period[]): HistoryRow[] {
  const sorted = [...periods].sort((a, b) => (a.start < b.start ? -1 : 1))
  return sorted
    .map((period, i) => {
      const next = sorted[i + 1]
      const cycleLength = next ? daysBetween(period.start, next.start) : null
      return {
        period,
        cycleLength,
        periodDays: period.end ? daysBetween(period.start, period.end) + 1 : null,
        suspicious: cycleLength !== null && isSuspiciousLength(cycleLength),
      }
    })
    .reverse()
}
