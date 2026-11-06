import { describe, expect, it } from 'vitest'
import { cycleStatus, type CycleSettings, type Period } from './cycle'
import { addDays } from './dates'
import { forecast, goalWindows, pastDays, suits, typicalPeriodDays, upcomingChanges, onFire, type ForecastDay } from './plan'

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

describe('onFire', () => {
  const day = (cycleDay: number, phase: ForecastDay['phase']): ForecastDay => ({
    date: '2026-11-01',
    cycleIndex: 0,
    cycleDay,
    phase,
    state: phase,
    period: null,
    confidence: 'alta',
  })

  it('covers Manifestación, the days around ovulation', () => {
    expect(onFire(day(12, 'manifestacion'))).toBe(true)
    expect(onFire(day(14, 'manifestacion'))).toBe(true)
    expect(onFire(day(9, 'poder1'))).toBe(false)
    expect(onFire(day(17, 'poder2'))).toBe(false)
  })
})

describe('pastDays (D27)', () => {
  it('fills the month before today from the logged periods', () => {
    const days = pastDays(cycleStatus(periods, settings, on(10))!, periods, '2026-10-01')
    expect(days).toHaveLength(9)
    expect(days.slice(0, 5).every((d) => d.period && d.state === 'recarga')).toBe(true)
    expect(days[5]).toMatchObject({ date: on(6), period: false, phase: 'poder1' })
  })

  it('uses the real length of a closed cycle', () => {
    // A 32-day cycle: ovulation on day 18, so day 16 is Manifestación (with 28 days it would be Poder 2).
    const long: Period[] = [{ start: '2026-09-01', end: '2026-09-05' }, { start: '2026-10-03', end: '2026-10-07' }]
    const days = pastDays(cycleStatus(long, settings, '2026-10-10')!, long, '2026-09-01')
    expect(days.find((d) => d.date === '2026-09-16')!.phase).toBe('manifestacion')
    expect(days.find((d) => d.date === '2026-10-02')!.phase).toBe('mimos')
  })

  it('leaves out days before the first period and gaps from a missed log', () => {
    const gap: Period[] = [{ start: '2026-07-01', end: '2026-07-05' }, { start: '2026-10-01', end: '2026-10-05' }]
    const days = pastDays(cycleStatus(gap, settings, on(3))!, gap, '2026-06-01')
    expect(days.map((d) => d.date)).toEqual([on(1), on(2)])
  })

  it('keeps the drop on every day of a period still running without an end', () => {
    const running: Period[] = [...periods.slice(0, 2), { start: '2026-10-01' }]
    const status = cycleStatus(running, settings, on(4))!
    expect(pastDays(status, running, '2026-10-01').every((d) => d.period)).toBe(true)
  })

  it('keeps the goals and the 🔥 of past days, judged on the real cycle', () => {
    const days = pastDays(cycleStatus(periods, settings, on(20))!, periods, '2026-10-01')
    const day12 = days.find((d) => d.date === on(12))!
    expect(onFire(day12)).toBe(true)
    expect(suits(day12, 'conectar', day12.cycleLength)).toBe(true)
    expect(suits(days[0]!, 'viaje', days[0]!.cycleLength)).toBe(false)
    expect(days.every((d) => !d.guess)).toBe(true)
  })

  it('marks the current cycle as a guess while the period is late', () => {
    const days = pastDays(cycleStatus(periods, settings, on(33))!, periods, '2026-10-01')
    expect(days.every((d) => d.guess)).toBe(true)
  })
})
