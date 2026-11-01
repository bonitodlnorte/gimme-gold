import { describe, expect, it } from 'vitest'
import { checkPeriod, historyRows } from './periods'

const periods = [{ start: '2026-08-24' }, { start: '2026-09-21', end: '2026-09-25' }, { start: '2026-10-20' }]
const today = '2026-11-01'

describe('checkPeriod', () => {
  it('accepts a normal new period', () => {
    expect(checkPeriod(periods, { start: '2026-07-26' }, today)).toEqual({ error: null, tooCloseDays: null })
  })

  it('rejects future starts, duplicates and bad ends', () => {
    expect(checkPeriod(periods, { start: '2026-11-02' }, today).error).toBe('futuro')
    expect(checkPeriod(periods, { start: '2026-09-21' }, today).error).toBe('duplicada')
    expect(checkPeriod(periods, { start: '2026-07-26', end: '2026-07-25' }, today).error).toBe('fin_antes')
    expect(checkPeriod(periods, { start: '2026-10-30', end: '2026-11-03' }, today).error).toBe('fin_futuro')
  })

  it('does not compare an edited period with itself', () => {
    expect(checkPeriod(periods, { start: '2026-09-21', end: '2026-09-26' }, today, '2026-09-21').error).toBeNull()
    expect(checkPeriod(periods, { start: '2026-09-22' }, today, '2026-09-21').tooCloseDays).toBeNull()
  })

  it('warns when a start is less than 21 days from another', () => {
    expect(checkPeriod(periods, { start: '2026-10-30' }, today).tooCloseDays).toBe(10)
  })
})

describe('historyRows', () => {
  it('lists most recent first with cycle and period lengths', () => {
    const rows = historyRows(periods)
    expect(rows.map((r) => [r.period.start, r.cycleLength, r.periodDays])).toEqual([
      ['2026-10-20', null, null],
      ['2026-09-21', 29, 5],
      ['2026-08-24', 28, null],
    ])
  })

  it('flags gaps that suggest a missing period', () => {
    const rows = historyRows([{ start: '2026-06-01' }, { start: '2026-08-24' }])
    expect(rows[1]).toMatchObject({ cycleLength: 84, suspicious: true })
  })
})
