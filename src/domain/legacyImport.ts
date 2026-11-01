// Reads data from the first version of Gimme Gold (decision D4): its localStorage keys
// on gimme-gold.vercel.app, and the v1 export file produced by its export banner.
// Old dates are ISO timestamps written at the device's local midnight, so they are read
// back as calendar days in the device's timezone.

import { isSuspiciousLength, type Period } from './cycle'
import { localDateOf, type LocalDate } from './dates'

export const LEGACY_KEYS = {
  lastPeriodDate: 'gimmeGold_lastPeriodDate',
  cycleLength: 'gimmeGold_cycleLength',
  cycleHistory: 'gimmeGold_cycleHistory',
} as const

export interface LegacyData {
  periods: Period[]
  declaredLength: number | null
}

interface RawData {
  lastPeriodDate: unknown
  cycleLength: unknown
  cycleHistory: unknown
}

function toLocalDate(value: unknown): LocalDate | null {
  if (typeof value !== 'string' || value === '') return null
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? null : localDateOf(date)
}

function toLength(value: unknown): number | null {
  const n = typeof value === 'number' ? value : typeof value === 'string' ? Number(value) : NaN
  return Number.isInteger(n) && !isSuspiciousLength(n) ? n : null
}

function normalize(raw: RawData): LegacyData | null {
  const byStart = new Map<LocalDate, Period>()

  if (Array.isArray(raw.cycleHistory)) {
    for (const entry of raw.cycleHistory) {
      if (typeof entry !== 'object' || entry === null) continue
      const start = toLocalDate((entry as { date?: unknown }).date)
      if (!start) continue
      const rawNote = (entry as { note?: unknown }).note
      const note = typeof rawNote === 'string' && rawNote.trim() !== '' ? rawNote.trim() : null
      const existing = byStart.get(start)
      byStart.set(start, { start, note: existing?.note ?? note })
    }
  }

  const last = toLocalDate(raw.lastPeriodDate)
  if (last && !byStart.has(last)) byStart.set(last, { start: last, note: null })

  const periods = [...byStart.values()].sort((a, b) => (a.start < b.start ? -1 : 1))
  const declaredLength = toLength(raw.cycleLength)
  if (periods.length === 0 && declaredLength === null) return null
  return { periods, declaredLength }
}

function parseJson(text: string | null): unknown {
  if (text === null) return null
  try {
    return JSON.parse(text)
  } catch {
    return null
  }
}

/** Data the old app left in this browser, or null when there is none. */
export function readLegacyStorage(storage: Pick<Storage, 'getItem'>): LegacyData | null {
  try {
    return normalize({
      lastPeriodDate: storage.getItem(LEGACY_KEYS.lastPeriodDate),
      cycleLength: storage.getItem(LEGACY_KEYS.cycleLength),
      cycleHistory: parseJson(storage.getItem(LEGACY_KEYS.cycleHistory)),
    })
  } catch {
    return null
  }
}

/** Contents of a `gimme-gold-YYYY-MM-DD.json` export file, or null when it is not one. */
export function parseExportFile(text: string): LegacyData | null {
  const file = parseJson(text) as { format?: unknown; version?: unknown; data?: Partial<RawData> } | null
  if (!file || file.format !== 'gimme-gold-export' || file.version !== 1 || !file.data) return null
  return normalize({
    lastPeriodDate: file.data.lastPeriodDate,
    cycleLength: file.data.cycleLength,
    cycleHistory: file.data.cycleHistory,
  })
}
