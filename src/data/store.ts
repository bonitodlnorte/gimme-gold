// Reads and writes the signed-in user's cycle data. RLS limits every query to her own rows.

import type { Contraception, CycleSettings, Period } from '../domain/cycle'
import type { LocalDate } from '../domain/dates'
import { supabase } from '../lib/supabase'

export interface Profile extends CycleSettings {
  legacyImported: boolean
}

export async function loadProfile(userId: string): Promise<Profile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('declared_cycle_length, contraception, legacy_imported_at')
    .eq('user_id', userId)
    .maybeSingle()
  if (error) throw error
  if (!data) return null
  return {
    declaredLength: data.declared_cycle_length,
    contraception: data.contraception as Contraception,
    legacyImported: data.legacy_imported_at !== null,
  }
}

export async function loadPeriods(userId: string): Promise<Period[]> {
  const { data, error } = await supabase
    .from('periods')
    .select('start_date, end_date, note')
    .eq('user_id', userId)
    .order('start_date')
  if (error) throw error
  return data.map((row) => ({ start: row.start_date, end: row.end_date, note: row.note }))
}

export interface Onboarding {
  settings: CycleSettings
  periods: Period[]
  /** True when the periods came from the old app (D4). */
  imported: boolean
}

/** Saves the profile with her health-data consent, then her periods. Safe to repeat. */
export async function saveOnboarding(userId: string, { settings, periods, imported }: Onboarding): Promise<void> {
  const now = new Date().toISOString()
  const profile = await supabase.from('profiles').upsert({
    user_id: userId,
    declared_cycle_length: settings.declaredLength,
    contraception: settings.contraception,
    health_consent_at: now,
    legacy_imported_at: imported ? now : null,
  })
  if (profile.error) throw profile.error

  const rows = periods.map((p) => ({
    user_id: userId,
    start_date: p.start,
    end_date: p.end ?? null,
    note: p.note ?? null,
  }))
  const saved = await supabase.from('periods').upsert(rows, { onConflict: 'user_id,start_date', ignoreDuplicates: true })
  if (saved.error) throw saved.error
}

function periodRow(period: Period) {
  return { start_date: period.start, end_date: period.end ?? null, note: period.note?.trim() || null }
}

export async function addPeriod(userId: string, period: Period): Promise<void> {
  const { error } = await supabase.from('periods').insert({ user_id: userId, ...periodRow(period) })
  if (error) throw error
}

/** Periods are identified by their start date, which is unique per user. */
export async function updatePeriod(userId: string, start: LocalDate, period: Period): Promise<void> {
  const { error } = await supabase.from('periods').update(periodRow(period)).eq('user_id', userId).eq('start_date', start)
  if (error) throw error
}

export async function deletePeriod(userId: string, start: LocalDate): Promise<void> {
  const { error } = await supabase.from('periods').delete().eq('user_id', userId).eq('start_date', start)
  if (error) throw error
}
