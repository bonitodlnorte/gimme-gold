// Reads and writes the signed-in user's cycle data. RLS limits every query to her own rows.

import type { Contraception, CycleSettings, Period } from '../domain/cycle'
import type { LocalDate } from '../domain/dates'
import type { PushKeys } from '../lib/push'
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

export async function updateProfile(userId: string, settings: CycleSettings): Promise<void> {
  const { error } = await supabase
    .from('profiles')
    .update({ declared_cycle_length: settings.declaredLength, contraception: settings.contraception })
    .eq('user_id', userId)
  if (error) throw error
}

/** Adds periods from an export file. Days she already has are left as they are. Returns how many were new. */
export async function importPeriods(userId: string, periods: Period[], existing: Period[]): Promise<number> {
  const known = new Set(existing.map((p) => p.start))
  const fresh = periods.filter((p) => !known.has(p.start))
  if (fresh.length === 0) return 0
  const { error } = await supabase.from('periods').insert(fresh.map((p) => ({ user_id: userId, ...periodRow(p) })))
  if (error) throw error
  return fresh.length
}

/** Deletes her account and, by cascade, all her data (supabase/migrations/0002_delete_account.sql). */
export async function deleteAccount(): Promise<void> {
  const { error } = await supabase.rpc('delete_my_account')
  if (error) throw error
  await supabase.auth.signOut()
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

// Partner links (D10). Only the SHA-256 of the token is stored; the token travels in the link.

function randomToken(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(24))
  return btoa(String.fromCharCode(...bytes)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

async function sha256Hex(text: string): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text))
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, '0')).join('')
}

export interface PartnerLink {
  expiresAt: string
}

export async function loadPartnerLink(userId: string): Promise<PartnerLink | null> {
  const { data, error } = await supabase
    .from('partner_links')
    .select('expires_at')
    .eq('user_id', userId)
    .is('revoked_at', null)
    .gt('expires_at', new Date().toISOString())
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()
  if (error) throw error
  return data ? { expiresAt: data.expires_at } : null
}

export async function revokePartnerLinks(userId: string): Promise<void> {
  const { error } = await supabase
    .from('partner_links')
    .update({ revoked_at: new Date().toISOString() })
    .eq('user_id', userId)
    .is('revoked_at', null)
  if (error) throw error
}

/** Creates a new link and revokes the previous one, so only one works at a time. Returns the token. */
export async function createPartnerLink(userId: string): Promise<string> {
  await revokePartnerLinks(userId)
  const token = randomToken()
  const { error } = await supabase.from('partner_links').insert({ user_id: userId, token_hash: await sha256Hex(token) })
  if (error) throw error
  return token
}

export interface PartnerView {
  cycleStart: LocalDate
  cycleLength: number
  orientative: boolean
}

/** What a partner link may see, or null when the link is unknown, revoked or expired. */
export async function fetchPartnerView(token: string): Promise<PartnerView | null> {
  const { data, error } = await supabase.rpc('partner_view', { token })
  if (error) throw error
  const row = Array.isArray(data) ? data[0] : null
  if (!row) return null
  return { cycleStart: row.cycle_start, cycleLength: row.cycle_length, orientative: row.orientative }
}

// Push subscriptions (avisos). Hers go through RLS; the partner's through RPCs by token, since he has
// no account. `lastKey` is today's state (src/domain/avisos.ts), so the cron never notifies the state
// the device was already in.



export async function savePushSubscription(userId: string, keys: PushKeys, lastKey: string): Promise<void> {
  const { error } = await supabase
    .from('push_subscriptions')
    .upsert({ user_id: userId, endpoint: keys.endpoint, p256dh: keys.p256dh, auth: keys.auth, last_key: lastKey }, { onConflict: 'endpoint' })
  if (error) throw error
}

export async function deletePushSubscription(endpoint: string): Promise<void> {
  const { error } = await supabase.from('push_subscriptions').delete().eq('endpoint', endpoint)
  if (error) throw error
}

/** Whether this device is registered for her account. */
export async function hasPushSubscription(userId: string, endpoint: string): Promise<boolean> {
  const { data, error } = await supabase.from('push_subscriptions').select('id').eq('user_id', userId).eq('endpoint', endpoint).maybeSingle()
  if (error) throw error
  return data !== null
}

/** Returns false when the link is no longer valid. */
export async function savePartnerPushSubscription(token: string, keys: PushKeys, lastKey: string): Promise<boolean> {
  const { data, error } = await supabase.rpc('partner_subscribe', {
    p_token: token,
    p_endpoint: keys.endpoint,
    p_p256dh: keys.p256dh,
    p_auth: keys.auth,
    p_last_key: lastKey,
  })
  if (error) throw error
  return data === true
}

export async function deletePartnerPushSubscription(token: string, endpoint: string): Promise<void> {
  const { error } = await supabase.rpc('partner_unsubscribe', { p_token: token, p_endpoint: endpoint })
  if (error) throw error
}

// Notifications (avisos). The daily cron (api/avisos.ts) covers everything; this only brings a change forward.

/**
 * Asks the server to send right now whatever notification her period change produced, mainly so her partner
 * hears about it at once. Fire and forget: never blocks the UI and never shows an error, the morning cron sends
 * it anyway.
 */
export function avisarAhora(): void {
  void supabase.auth
    .getSession()
    .then(({ data }) => {
      const token = data.session?.access_token
      if (!token) return
      return fetch('/api/avisar', { method: 'POST', headers: { authorization: `Bearer ${token}` }, keepalive: true })
    })
    .catch(() => undefined)
}
