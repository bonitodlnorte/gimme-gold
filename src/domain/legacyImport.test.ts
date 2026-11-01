// Runs with TZ=Europe/Madrid (see the test script), like the old app's users.
import { describe, expect, it } from 'vitest'
import { buildExportFile, LEGACY_KEYS, parseExportFile, readLegacyStorage } from './legacyImport'

function storage(values: Record<string, string>) {
  return { getItem: (key: string) => values[key] ?? null }
}

// Local midnight in Madrid, as the old app saved it.
const OCT_20 = '2026-10-19T22:00:00.000Z' // summer time
const SEP_21 = '2026-09-20T22:00:00.000Z'
const DEC_01 = '2025-11-30T23:00:00.000Z' // winter time

describe('readLegacyStorage', () => {
  it('returns null when the old app left nothing', () => {
    expect(readLegacyStorage(storage({}))).toBeNull()
  })

  it('reads history, last period and cycle length as Madrid calendar days', () => {
    const data = readLegacyStorage(
      storage({
        [LEGACY_KEYS.cycleHistory]: JSON.stringify([
          { id: '2', date: SEP_21, cycleLength: 29, note: ' Dolor fuerte ' },
          { id: '1', date: DEC_01, cycleLength: null, note: '' },
        ]),
        [LEGACY_KEYS.lastPeriodDate]: OCT_20,
        [LEGACY_KEYS.cycleLength]: '29',
      }),
    )
    expect(data).toEqual({
      periods: [
        { start: '2025-12-01', note: null },
        { start: '2026-09-21', note: 'Dolor fuerte' },
        { start: '2026-10-20', note: null },
      ],
      declaredLength: 29,
    })
  })

  it('does not duplicate the last period when it is also in the history', () => {
    const data = readLegacyStorage(
      storage({
        [LEGACY_KEYS.cycleHistory]: JSON.stringify([{ id: '1', date: OCT_20, note: 'Hola' }]),
        [LEGACY_KEYS.lastPeriodDate]: OCT_20,
      }),
    )
    expect(data?.periods).toEqual([{ start: '2026-10-20', note: 'Hola' }])
  })

  it('survives corrupt values', () => {
    const data = readLegacyStorage(
      storage({
        [LEGACY_KEYS.cycleHistory]: '{not json',
        [LEGACY_KEYS.lastPeriodDate]: 'not a date',
        [LEGACY_KEYS.cycleLength]: '90',
      }),
    )
    expect(data).toBeNull()
  })
})

describe('parseExportFile', () => {
  it('reads a v1 export', () => {
    const file = JSON.stringify({
      format: 'gimme-gold-export',
      version: 1,
      exportedAt: '2026-10-25T10:00:00.000Z',
      data: {
        lastPeriodDate: OCT_20,
        cycleLength: 28,
        cycleHistory: [{ id: '1', date: SEP_21, cycleLength: null, note: '' }],
      },
    })
    expect(parseExportFile(file)).toEqual({
      periods: [
        { start: '2026-09-21', note: null },
        { start: '2026-10-20', note: null },
      ],
      declaredLength: 28,
    })
  })

  it('rejects other files', () => {
    expect(parseExportFile('{"format":"otra-cosa","version":1,"data":{}}')).toBeNull()
    expect(parseExportFile('nope')).toBeNull()
  })
})

describe('v2 export file', () => {
  it('round-trips what Ajustes exports', () => {
    const periods = [
      { start: '2026-09-21', end: '2026-09-25', note: 'Dolor fuerte el día 1' },
      { start: '2026-10-20', end: null, note: null },
    ]
    const text = buildExportFile({ declaredLength: 29, contraception: 'no' }, periods, new Date('2026-11-01T10:00:00Z'))
    expect(parseExportFile(text)).toEqual({ periods, declaredLength: 29 })
  })

  it('skips malformed periods', () => {
    const text = JSON.stringify({
      format: 'gimme-gold-export',
      version: 2,
      data: { periods: [{ start: 'ayer' }, { start: '2026-10-20', end: '2026-10-01' }] },
    })
    expect(parseExportFile(text)).toEqual({ periods: [{ start: '2026-10-20', end: null, note: null }], declaredLength: null })
  })
})
