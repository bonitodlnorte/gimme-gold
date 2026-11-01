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
    // What's coming reads exactly like a normal last countdown day, all approximate.
    const lastDay = partnerStatus(view, onDay(28))
    expect(late.ahead.map((s) => [s.state, s.estimated])).toEqual(lastDay.ahead.map((s) => [s.state, true]))
    expect(late.ahead[0]).toMatchObject({ state: 'regla', from: onDay(34) })
  })

  it('splits the next six weeks into segments to plan with', () => {
    const ahead = partnerStatus(view, onDay(18)).ahead
    expect(ahead.map((s) => [s.state, s.from, s.to, s.current, s.estimated])).toEqual([
      ['poder2', onDay(19), onDay(19), true, false],
      ['mimos', onDay(20), onDay(25), false, false],
      ['codigo-rojo', onDay(26), onDay(28), false, false],
      ['regla', onDay(29), onDay(30), false, true],
      ['poder1', onDay(31), onDay(38), false, true],
      ['manifestacion', onDay(39), onDay(43), false, true],
      ['poder2', onDay(44), onDay(47), false, true],
      ['mimos', onDay(48), onDay(53), false, true],
      ['codigo-rojo', onDay(54), onDay(56), false, true],
      ['regla', onDay(57), onDay(58), false, true],
      ['poder1', onDay(59), onDay(60), false, true],
    ])
    expect(ahead[ahead.length - 1]!.open).toBe(true)
  })
})
