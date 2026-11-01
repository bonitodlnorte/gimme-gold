import { useMemo, useState } from 'react'
import { cycleStatus, type CycleSettings, type Period } from './domain/cycle'
import { addDays, today } from './domain/dates'
import { readLegacyStorage } from './domain/legacyImport'
import { CicloScreen } from './screens/Ciclo'

// Temporary until the Supabase account and the onboarding flow exist: the cycle comes from
// the old app's data in this browser, or from a sample, and changes live only in memory.
function initialData(): { periods: Period[]; settings: CycleSettings } {
  const legacy = readLegacyStorage(window.localStorage)
  if (legacy && legacy.periods.length > 0) {
    return { periods: legacy.periods, settings: { declaredLength: legacy.declaredLength, contraception: 'no' } }
  }
  const start = addDays(today(), -12)
  return {
    periods: [{ start: addDays(start, -56) }, { start: addDays(start, -28) }, { start }],
    settings: { declaredLength: null, contraception: 'no' },
  }
}

export function App() {
  const [{ periods, settings }, setData] = useState(initialData)
  const status = useMemo(() => cycleStatus(periods, settings, today()), [periods, settings])

  if (!status) return null

  return (
    <CicloScreen
      status={status}
      contraception={settings.contraception}
      onPeriodStarted={() => setData((d) => ({ ...d, periods: [...d.periods, { start: today() }] }))}
      onPeriodEnded={() =>
        setData((d) => ({
          ...d,
          periods: d.periods.map((p) => (p.start === status.cycleStart ? { ...p, end: today() } : p)),
        }))
      }
    />
  )
}
