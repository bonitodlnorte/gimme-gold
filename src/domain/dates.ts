// Calendar dates without time or timezone, as 'YYYY-MM-DD'.
// Period dates are calendar days, so all arithmetic is done in UTC to avoid DST shifts.

export type LocalDate = string

const DAY_MS = 86_400_000
const PATTERN = /^\d{4}-\d{2}-\d{2}$/

export function isLocalDate(value: unknown): value is LocalDate {
  if (typeof value !== 'string' || !PATTERN.test(value)) return false
  return toUtcMs(value) !== null
}

function toUtcMs(date: LocalDate): number | null {
  const [y, m, d] = date.split('-').map(Number) as [number, number, number]
  const ms = Date.UTC(y, m - 1, d)
  const back = new Date(ms)
  if (back.getUTCFullYear() !== y || back.getUTCMonth() !== m - 1 || back.getUTCDate() !== d) return null
  return ms
}

function fromUtcMs(ms: number): LocalDate {
  return new Date(ms).toISOString().slice(0, 10)
}

function mustMs(date: LocalDate): number {
  const ms = toUtcMs(date)
  if (ms === null) throw new Error(`Invalid date: ${date}`)
  return ms
}

export function addDays(date: LocalDate, days: number): LocalDate {
  return fromUtcMs(mustMs(date) + days * DAY_MS)
}

/** Whole days from `from` to `to` (positive when `to` is later). */
export function daysBetween(from: LocalDate, to: LocalDate): number {
  return Math.round((mustMs(to) - mustMs(from)) / DAY_MS)
}

/** The calendar day of a JS Date in the device's timezone. */
export function localDateOf(date: Date): LocalDate {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

/** A JS Date at local noon of that day, for display formatting. */
export function toJsDate(date: LocalDate): Date {
  const [y, m, d] = date.split('-').map(Number) as [number, number, number]
  return new Date(y, m - 1, d, 12)
}

export function today(): LocalDate {
  return localDateOf(new Date())
}
