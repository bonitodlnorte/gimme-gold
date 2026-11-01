import { useCallback, useEffect, useMemo, useState } from 'react'
import type { Session } from '@supabase/supabase-js'
import { Billy } from './components/Billy'
import { addPeriod, endPeriod, loadPeriods, loadProfile, saveOnboarding, type Onboarding, type Profile } from './data/store'
import { cycleStatus, type Period } from './domain/cycle'
import { today } from './domain/dates'
import { readLegacyStorage } from './domain/legacyImport'
import { supabase } from './lib/supabase'
import { AltaScreen } from './screens/Alta'
import { CicloScreen } from './screens/Ciclo'
import { LoginScreen } from './screens/Login'

type UserData = { profile: Profile | null; periods: Period[] }

function Waiting({ text }: { text: string }) {
  return (
    <main className="screen waiting">
      <Billy mood="muerto" size={120} />
      <p>{text}</p>
    </main>
  )
}

export function App() {
  // undefined while Supabase restores the session from this browser.
  const [session, setSession] = useState<Session | null | undefined>(undefined)
  const [data, setData] = useState<UserData | null>(null)
  const [failed, setFailed] = useState(false)
  const userId = session?.user.id

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session))
    const { data: sub } = supabase.auth.onAuthStateChange((_event, next) => setSession(next))
    return () => sub.subscription.unsubscribe()
  }, [])

  const reload = useCallback(async () => {
    if (!userId) return setData(null)
    try {
      const [profile, periods] = await Promise.all([loadProfile(userId), loadPeriods(userId)])
      setData({ profile, periods })
      setFailed(false)
    } catch {
      setFailed(true)
    }
  }, [userId])

  useEffect(() => {
    setData(null)
    void reload()
  }, [reload])

  const legacy = useMemo(() => {
    const found = readLegacyStorage(window.localStorage)
    return found && found.periods.length > 0 ? found : null
  }, [])

  const status = useMemo(
    () => (data?.profile ? cycleStatus(data.periods, data.profile, today()) : null),
    [data],
  )

  if (session === undefined) return <Waiting text="Despertando a Billy…" />
  if (!session || !userId) return <LoginScreen />
  if (failed) {
    return (
      <main className="screen waiting">
        <Billy mood="desolado" size={120} />
        <p>No consigo traer tus datos. ¿Tienes conexión?</p>
        <button type="button" className="btn btn--go" onClick={() => void reload()}>
          Reintentar
        </button>
      </main>
    )
  }
  if (!data) return <Waiting text="Cargando tu ciclo…" />

  if (!data.profile || !status) {
    return (
      <AltaScreen
        legacy={data.profile ? null : legacy}
        onDone={async (onboarding: Onboarding) => {
          await saveOnboarding(userId, onboarding)
          await reload()
        }}
      />
    )
  }

  return (
    <CicloScreen
      status={status}
      contraception={data.profile.contraception}
      onPeriodStarted={async () => {
        await addPeriod(userId, today())
        await reload()
      }}
      onPeriodEnded={async () => {
        await endPeriod(userId, status.cycleStart, today())
        await reload()
      }}
      onSignOut={() => void supabase.auth.signOut()}
    />
  )
}
