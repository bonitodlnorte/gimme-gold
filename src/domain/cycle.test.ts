import { describe, expect, it } from 'vitest'
import {
  completedCycleLengths,
  cycleStatus,
  estimateCycleLength,
  fertileWindow,
  phaseForCycleDay,
  projectDays,
  type CycleSettings,
  type Period,
} from './cycle'
import { addDays } from './dates'

const settings: CycleSettings = { declaredLength: null, contraception: 'no' }

/** Periods starting at `first` with the given cycle lengths between them. */
function periodsWith(first: string, lengths: number[]): Period[] {
  const periods: Period[] = [{ start: first }]
  let start = first
  for (const length of lengths) {
    start = addDays(start, length)
    periods.push({ start })
  }
  return periods
}

function phasesFor(length: number) {
  return Array.from({ length }, (_, i) => phaseForCycleDay(i + 1, length))
}

function ranges(length: number) {
  const phases = phasesFor(length)
  const result: Record<string, [number, number]> = {}
  phases.forEach((phase, i) => {
    const day = i + 1
    result[phase] = result[phase] ? [result[phase]![0], day] : [day, day]
  })
  return result
}

describe('phaseForCycleDay', () => {
  it('matches Pelz for a 28-day cycle', () => {
    expect(ranges(28)).toEqual({
      poder1: [1, 10],
      manifestacion: [11, 15],
      poder2: [16, 19],
      mimos: [20, 28],
    })
  })

  it('stretches the first half in long cycles and keeps the second half', () => {
    expect(ranges(35)).toEqual({
      poder1: [1, 17],
      manifestacion: [18, 22],
      poder2: [23, 26],
      mimos: [27, 35],
    })
  })

  it('shortens the first half in short cycles', () => {
    expect(ranges(24)).toEqual({
      poder1: [1, 6],
      manifestacion: [7, 11],
      poder2: [12, 15],
      mimos: [16, 24],
    })
  })
})

describe('fertileWindow', () => {
  it('runs from five days before ovulation to the day after', () => {
    expect(fertileWindow(28)).toEqual({ from: 9, to: 15 })
    expect(fertileWindow(24)).toEqual({ from: 5, to: 11 })
  })
})

describe('estimateCycleLength', () => {
  it('uses the declared length without history', () => {
    expect(estimateCycleLength([{ start: '2026-10-01' }], 31)).toMatchObject({ length: 31, source: 'declarada' })
  })

  it('falls back to 28', () => {
    expect(estimateCycleLength([], null)).toMatchObject({ length: 28, source: 'por_defecto' })
  })

  it('takes the median of the last six cycles', () => {
    // Oldest cycle (40) falls outside the window of six.
    const periods = periodsWith('2026-01-01', [40, 27, 28, 29, 30, 29, 28])
    expect(completedCycleLengths(periods)).toEqual([28, 29, 30, 29, 28, 27, 40])
    expect(estimateCycleLength(periods, null)).toMatchObject({ length: 29, source: 'historial', basedOn: 6, spread: 3 })
  })

  it('ignores a suspicious cycle, such as a missed log', () => {
    const periods = periodsWith('2026-01-01', [28, 56, 29])
    expect(estimateCycleLength(periods, null)).toMatchObject({ length: 29, basedOn: 2 })
  })

  it('flags irregular cycles', () => {
    const periods = periodsWith('2026-01-01', [24, 35, 28])
    expect(estimateCycleLength(periods, null)).toMatchObject({ spread: 11, irregular: true })
  })
})

describe('cycleStatus', () => {
  const periods = periodsWith('2026-09-03', [28, 28])

  it('returns null before any period', () => {
    expect(cycleStatus([], settings, '2026-11-01')).toBeNull()
  })

  it('computes day, phase and fertility', () => {
    const status = cycleStatus(periods, settings, addDays('2026-10-29', 12))!
    expect(status).toMatchObject({ cycleDay: 13, phase: 'manifestacion', fertile: true, daysLate: 0 })
    expect(status.nextPeriod.expected).toBe('2026-11-26')
  })

  it('hides fertility with hormonal contraception and warns', () => {
    const status = cycleStatus(periods, { declaredLength: null, contraception: 'si' }, '2026-11-10')!
    expect(status.fertile).toBeNull()
    expect(status.showWarning).toBe(true)
  })

  it('stays in Mimos when the period is late', () => {
    const status = cycleStatus(periods, settings, addDays('2026-10-29', 30))!
    expect(status).toMatchObject({ cycleDay: 31, daysLate: 3, phase: 'mimos', fertile: null })
  })

  it('uses the logged end of the period', () => {
    const withEnd: Period[] = [...periods.slice(0, -1), { start: '2026-10-29', end: '2026-10-31' }]
    expect(cycleStatus(withEnd, settings, '2026-11-01')!.periodOngoing).toBe(false)
    expect(cycleStatus(periods, settings, '2026-11-01')!.periodOngoing).toBe(true)
  })
})

describe('projectDays', () => {
  it('rolls into the next predicted cycle and marks it uncertain', () => {
    const status = cycleStatus(periodsWith('2026-09-03', [28, 28]), settings, '2026-11-22')!
    const days = projectDays(status, 7)
    expect(days.map((d) => d.cycleDay)).toEqual([25, 26, 27, 28, 1, 2, 3])
    expect(days[4]).toMatchObject({ phase: 'poder1', uncertain: true })
    expect(days[0]!.uncertain).toBe(false)
  })
})
