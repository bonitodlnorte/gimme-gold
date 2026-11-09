import { describe, expect, it } from 'vitest'
import { avisoElla, avisoPareja } from './avisos'
import { cycleStatus, type CycleSettings, type Period } from './cycle'
import { addDays } from './dates'

const settings: CycleSettings = { declaredLength: 28, contraception: 'no' }
const start = '2026-10-01'
const periods: Period[] = [{ start }]

/** Her key and event for each day of the cycle, 1-based. */
function herDays(days: number) {
  return Array.from({ length: days }, (_, i) => {
    const status = cycleStatus(periods, settings, addDays(start, i))!
    return { day: i + 1, ...avisoElla(status) }
  })
}

describe('avisoElla', () => {
  it('changes key exactly when a notifiable state begins (28-day cycle)', () => {
    const days = herDays(30)
    const changes = days.filter((d, i) => i === 0 || d.key !== days[i - 1]!.key)
    expect(changes.map((d) => [d.day, d.evento])).toEqual([
      [1, null], // Poder 1: she logged it herself
      [11, 'manifestacion'],
      [16, 'poder2'],
      [20, 'mimos'],
      [26, 'regla48'], // two days before day 28
    ])
  })

  it('keeps the heads-up key while the period is late, so Mimos is not announced again', () => {
    const days = herDays(35)
    for (const d of days.slice(25)) expect(d.key).toBe(`regla48:${start}`)
  })

  it('a newly logged period is a change with nothing to say', () => {
    const next = addDays(start, 30)
    const status = cycleStatus([...periods, { start: next }], settings, next)!
    expect(avisoElla(status)).toEqual({ key: `fase:poder1:${next}`, evento: null })
  })
})

describe('avisoPareja', () => {
  const view = { cycleStart: start, cycleLength: 28, orientative: false }
  const keys = (days: number) => Array.from({ length: days }, (_, i) => ({ day: i + 1, ...avisoPareja(view, addDays(start, i)) }))

  it('follows his states through the cycle', () => {
    const days = keys(28)
    const changes = days.filter((d, i) => i === 0 || d.key !== days[i - 1]!.key)
    expect(changes.map((d) => [d.day, d.evento])).toEqual([
      [1, 'regla'],
      [3, 'poder1'],
      [11, 'manifestacion'],
      [16, 'poder2'],
      [20, 'mimos'],
      [26, 'codigo-rojo'],
    ])
  })

  it('stays in código rojo with the same key while the period is late', () => {
    for (let i = 25; i < 40; i++) expect(avisoPareja(view, addDays(start, i)).key).toBe(`estado:codigo-rojo:${start}`)
  })

  it('a new cycle start is a new key even in the same state', () => {
    const a = avisoPareja(view, start)
    const b = avisoPareja({ ...view, cycleStart: addDays(start, 29) }, addDays(start, 29))
    expect(a.evento).toBe(b.evento)
    expect(a.key).not.toBe(b.key)
  })
})
