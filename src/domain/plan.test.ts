import { describe, expect, it } from 'vitest'
import { cycleStatus, type CycleSettings, type Period } from './cycle'
import { addDays } from './dates'
import { dayMarks, forecast, goalWindows, typicalPeriodDays, upcomingChanges, type ForecastDay } from './plan'

const settings: CycleSettings = { declaredLength: null, contraception: 'no' }
// Three regular 28-day cycles; the current one started on 1 Oct.
const periods: Period[] = [
  { start: '2026-08-06', end: '2026-08-10' },
  { start: '2026-09-03', end: '2026-09-07' },
  { start: '2026-10-01', end: '2026-10-05' },
]
const on = (day: number) => addDays('2026-10-01', day - 1)

describe('forecast', () => {
  it('rolls phases into the next cycles and predicts the periods', () => {
    const fc = forecast(cycleStatus(periods, settings, on(10))!, periods)
    const byDate = new Map(fc.days.map((d) => [d.date, d]))
    expect(byDate.get(on(10))).toMatchObject({ cycleIndex: 0, cycleDay: 10, phase: 'poder1', period: null })
    expect(byDate.get(on(29))).toMatchObject({ cycleIndex: 1, cycleDay: 1, state: 'recarga', period: 'probable' })
    expect(byDate.get(on(33))).toMatchObject({ cycleDay: 5, period: 'probable' })
    expect(byDate.get(on(40))).toMatchObject({ cycleDay: 12, phase: 'manifestacion' })
    expect(fc.days).toHaveLength(183)
  })

  it('widens the margin around periods further ahead', () => {
    const fc = forecast(cycleStatus(periods, settings, on(10))!, periods)
    const posible = (k: number) => fc.days.filter((d) => d.cycleIndex >= k - 1 && d.period === 'posible').length
    expect(fc.days.find((d) => d.cycleIndex === 1)!.confidence).toBe('media')
    expect(fc.days.find((d) => d.cycleIndex === 6)!.confidence).toBe('baja')
    expect(posible(6)).toBeGreaterThan(0)
  })

  it('marks the current period as ongoing', () => {
    const fc = forecast(cycleStatus([...periods.slice(0, 2), { start: '2026-10-01' }], settings, on(2))!, periods)
    expect(fc.days.slice(0, 4).map((d) => d.period)).toEqual(['en_curso', 'en_curso', 'en_curso', 'en_curso'])
  })
})

describe('goals', () => {
  it('finds the best windows for hard training and for rest', () => {
    const fc = forecast(cycleStatus(periods, settings, on(1))!, periods)
    expect(goalWindows(fc, 'entrenar')[0]).toEqual({ from: on(6), to: on(19) })
    expect(goalWindows(fc, 'descansar')[0]).toEqual({ from: on(1), to: on(5) })
    expect(goalWindows(fc, 'descansar')[1]!.from).toBe(on(20))
  })

  it('lists the next phase changes', () => {
    const fc = forecast(cycleStatus(periods, settings, on(10))!, periods)
    expect(upcomingChanges(fc)).toEqual([
      { state: 'manifestacion', date: on(11), period: null },
      { state: 'poder2', date: on(16), period: null },
      { state: 'mimos', date: on(20), period: null },
    ])
  })
})

describe('typicalPeriodDays', () => {
  it('uses the median of the logged ends, or 5', () => {
    expect(typicalPeriodDays(periods)).toBe(5)
    expect(typicalPeriodDays([{ start: '2026-10-01' }])).toBe(5)
    expect(typicalPeriodDays([{ start: '2026-10-01', end: '2026-10-03' }])).toBe(3)
  })
})

describe('dayMarks', () => {
  const day = (cycleDay: number, phase: ForecastDay['phase']): ForecastDay => ({
    date: '2026-11-01',
    cycleIndex: 0,
    cycleDay,
    phase,
    state: phase,
    period: null,
    confidence: 'alta',
  })

  it('marks ovulation at L−14, the two days before as most fertile, and Manifestación as peak libido', () => {
    expect(dayMarks(day(14, 'manifestacion'), 28)).toEqual({ ovulation: true, fertile: false, libido: true })
    expect(dayMarks(day(12, 'manifestacion'), 28)).toEqual({ ovulation: false, fertile: true, libido: true })
    expect(dayMarks(day(15, 'manifestacion'), 28)).toEqual({ ovulation: false, fertile: false, libido: true })
    expect(dayMarks(day(9, 'poder1'), 28)).toEqual({ ovulation: false, fertile: false, libido: false })
  })
})
