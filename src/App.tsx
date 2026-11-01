import { useCallback, useEffect, useMemo, useState } from 'react'
import type { Session } from '@supabase/supabase-js'
import { Navigate, Route, Routes } from 'react-router-dom'
import { Billy } from './components/Billy'
import {
  addPeriod,
  deleteAccount,
  deletePeriod,
  importPeriods,
  loadPeriods,
  loadProfile,
  saveOnboarding,
  updatePeriod,
  updateProfile,
  type Onboarding,
  type Profile,
} from './data/store'
import { cycleStatus, type Period } from './domain/cycle'
import { today } from './domain/dates'
import { readLegacyStorage } from './domain/legacyImport'
import { supabase } from './lib/supabase'
import { AjustesScreen } from './screens/Ajustes'
import { AltaScreen } from './screens/Alta'
import { AprenderScreen, FichaScreen } from './screens/Aprender'
import { CicloScreen } from './screens/Ciclo'
import { CompartirScreen } from './screens/Compartir'
import { HistorialScreen } from './screens/Historial'
import { LoginScreen } from './screens/Login'
import { PlanScreen } from './screens/Plan'

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

  // Every change goes to Supabase and then reloads, so the cycle is always computed from what is saved.
  const saved =
    <A extends unknown[]>(action: (...args: A) => Promise<void>) =>
    async (...args: A) => {
      await action(...args)
      await reload()
    }
  const current = data.periods.find((p) => p.start === status.cycleStart) ?? { start: status.cycleStart }

  return (
    <Routes>
      <Route
        path="/"
        element={
          <CicloScreen
            status={status}
            contraception={data.profile.contraception}
            periods={data.periods}
            onPeriodStarted={saved((period) => addPeriod(userId, period))}
            onPeriodEnded={saved(() => updatePeriod(userId, status.cycleStart, { ...current, end: today() }))}
          />
        }
      />
      <Route
        path="/historial"
        element={
          <HistorialScreen
            periods={data.periods}
            estimate={status.estimate}
            periodOngoing={status.periodOngoing}
            onAdd={saved((period) => addPeriod(userId, period))}
            onUpdate={saved((start, period) => updatePeriod(userId, start, period))}
            onDelete={saved((start) => deletePeriod(userId, start))}
          />
        }
      />
      <Route path="/plan" element={<PlanScreen status={status} periods={data.periods} contraception={data.profile.contraception} />} />
      <Route path="/aprender" element={<AprenderScreen cycleLength={status.estimate.length} currentPhase={status.phase} />} />
      <Route path="/aprender/:tema" element={<FichaScreen cycleLength={status.estimate.length} currentPhase={status.phase} />} />
      <Route path="/compartir" element={<CompartirScreen userId={userId} />} />
      <Route
        path="/ajustes"
        element={
          <AjustesScreen
            email={session.user.email ?? ''}
            settings={data.profile}
            periods={data.periods}
            estimate={status.estimate}
            onSaveSettings={saved((settings) => updateProfile(userId, settings))}
            onImport={async (periods) => {
              const added = await importPeriods(userId, periods, data.periods)
              await reload()
              return added
            }}
            onDeleteAccount={deleteAccount}
            onSignOut={() => void supabase.auth.signOut()}
          />
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
