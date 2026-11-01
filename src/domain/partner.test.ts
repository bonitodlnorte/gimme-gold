import { describe, expect, it } from 'vitest'
import { addDays } from './dates'
import { partnerStatus } from './partner'

const start = '2026-10-01'
const view = { cycleStart: start, cycleLength: 28, orientative: false }
const onDay = (n: number) => addDays(start, n - 1)

describe('partnerStatus', () => {
  it('maps cycle days to the partner states', () => {
    const states = [1, 2, 3, 10, 11, 15, 16, 19, 20, 25, 26, 28].map((d) => [d, partnerStatus(view, onDay(d)).state])
    expect(states).toEqual([
      [1, 'regla'],
      [2, 'regla'],
      [3, 'poder1'],
      [10, 'poder1'],
      [11, 'manifestacion'],
      [15, 'manifestacion'],
      [16, 'poder2'],
      [19, 'poder2'],
      [20, 'mimos'],
      [25, 'mimos'],
      [26, 'codigo-rojo'],
      [28, 'codigo-rojo'],
    ])
  })

  it('announces the next phase or the period within three days', () => {
    expect(partnerStatus(view, onDay(8)).upcoming).toEqual({ to: 'manifestacion', inDays: 3 })
    expect(partnerStatus(view, onDay(18)).upcoming).toEqual({ to: 'mimos', inDays: 2 })
    expect(partnerStatus(view, onDay(27)).upcoming).toEqual({ to: 'regla', inDays: 2 })
    expect(partnerStatus(view, onDay(3)).upcoming).toBeNull()
  })

  it('keeps a late period in the countdown without revealing it', () => {
    const late = partnerStatus(view, onDay(33))
    expect(late.state).toBe('codigo-rojo')
    expect(late.upcoming).toBeNull()
    expect(late.days.every((d) => d.phase === 'mimos' && d.predicted)).toBe(true)
  })

  it('rolls the strip into the next predicted cycle', () => {
    const days = partnerStatus(view, onDay(27)).days
    expect(days.map((d) => [d.phase, d.predicted])).toEqual([
      ['mimos', false],
      ['mimos', false],
      ['poder1', true],
      ['poder1', true],
      ['poder1', true],
      ['poder1', true],
      ['poder1', true],
    ])
  })
})
