import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import { sendNotification, setVapidDetails } from 'web-push'
import { AVISOS_ELLA, AVISOS_PAREJA, type AvisoCopy } from '../../src/content/avisos.js'
import { avisoElla, avisoPareja } from '../../src/domain/avisos.js'
import { cycleStatus, type Contraception, type Period } from '../../src/domain/cycle.js'
import type { LocalDate } from '../../src/domain/dates.js'

// Sending notifications, shared by the daily cron (api/avisos.ts) and the on-the-spot call when she logs her
// period (api/avisar.ts). For every subscribed device given it computes today's state key (src/domain/avisos.ts),
// compares it with the last one notified and sends when it changed. Her devices hang from her account; the
// partner's from a valid link, and his state is computed the same way partner_view() does, so he gets exactly
// what his page would show. Folders starting with "_" under api/ are not deployed as functions.

const TZ = 'Europe/Madrid'

/** Today as a calendar day in Spain, whatever the server's clock says. */
export function todayIn(tz: string = TZ): LocalDate {
  const parts = new Intl.DateTimeFormat('en-CA', { timeZone: tz, year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date())
  return parts // en-CA gives YYYY-MM-DD
}

export const SUBSCRIPTION_COLUMNS = 'id, user_id, partner_link_id, endpoint, p256dh, auth, last_key'

export interface SubscriptionRow {
  id: string
  user_id: string | null
  partner_link_id: string | null
  endpoint: string
  p256dh: string
  auth: string
  last_key: string | null
}

interface Payload extends AvisoCopy {
  icon: string
  tag: string
}

export interface Resultado {
  today: LocalDate
  sent: number
  unchanged: number
  dropped: number
  failures: string[]
}

/**
 * Admin client with VAPID configured, or null when Vercel lacks a variable. Needs SUPABASE_SERVICE_ROLE_KEY,
 * VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY and VAPID_SUBJECT (mailto:…).
 */
export function adminParaAvisos(): SupabaseClient | null {
  const url = process.env.VITE_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  const vapidPublic = process.env.VAPID_PUBLIC_KEY
  const vapidPrivate = process.env.VAPID_PRIVATE_KEY
  const subject = process.env.VAPID_SUBJECT
  if (!url || !serviceKey || !vapidPublic || !vapidPrivate || !subject) return null
  setVapidDetails(subject, vapidPublic, vapidPrivate)
  return createClient(url, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } })
}

/** Sends to the devices given whatever changed since they were last notified, and records it in last_key. */
export async function enviarAvisos(admin: SupabaseClient, rows: SubscriptionRow[]): Promise<Resultado> {
  const today = todayIn()
  if (rows.length === 0) return { today, sent: 0, unchanged: 0, dropped: 0, failures: [] }

  // Partner devices hang from a link that must still be valid; expired or revoked ones are dropped.
  const linkIds = [...new Set(rows.map((r) => r.partner_link_id).filter((x): x is string => x !== null))]
  const linkOwner = new Map<string, string>()
  if (linkIds.length > 0) {
    const { data: links } = await admin
      .from('partner_links')
      .select('id, user_id')
      .in('id', linkIds)
      .is('revoked_at', null)
      .gt('expires_at', new Date().toISOString())
    for (const l of links ?? []) linkOwner.set(l.id as string, l.user_id as string)
  }

  const owners = [...new Set([...rows.map((r) => r.user_id), ...linkOwner.values()].filter((x): x is string => x !== null))]
  const [{ data: profiles }, { data: periods }] = await Promise.all([
    admin.from('profiles').select('user_id, declared_cycle_length, contraception').in('user_id', owners),
    admin.from('periods').select('user_id, start_date, end_date').in('user_id', owners).order('start_date'),
  ])
  const settingsOf = new Map<string, { declaredLength: number | null; contraception: Contraception }>()
  for (const p of profiles ?? []) {
    settingsOf.set(p.user_id as string, { declaredLength: p.declared_cycle_length as number | null, contraception: p.contraception as Contraception })
  }
  const periodsOf = new Map<string, Period[]>()
  for (const p of periods ?? []) {
    const list = periodsOf.get(p.user_id as string) ?? []
    list.push({ start: p.start_date as string, end: p.end_date as string | null })
    periodsOf.set(p.user_id as string, list)
  }

  function statusOf(userId: string) {
    const settings = settingsOf.get(userId)
    if (!settings) return null
    return cycleStatus(periodsOf.get(userId) ?? [], settings, today)
  }

  let sent = 0
  let unchanged = 0
  let dropped = 0
  const failures: string[] = []

  for (const row of rows) {
    let key: string
    let payload: Payload | null = null

    if (row.user_id) {
      const status = statusOf(row.user_id)
      if (!status) continue
      const aviso = avisoElla(status)
      key = aviso.key
      if (aviso.evento) payload = { ...AVISOS_ELLA[aviso.evento], icon: '/icons/icon-192.png', tag: 'ella' }
    } else if (row.partner_link_id) {
      const owner = linkOwner.get(row.partner_link_id)
      if (!owner) {
        await admin.from('push_subscriptions').delete().eq('id', row.id)
        dropped++
        continue
      }
      const status = statusOf(owner)
      if (!status) continue
      const aviso = avisoPareja({ cycleStart: status.cycleStart, cycleLength: status.estimate.length, orientative: status.showWarning }, today)
      key = aviso.key
      // Tapping it opens the page the device subscribed from (his link): the service worker remembers it.
      if (aviso.evento) payload = { ...AVISOS_PAREJA[aviso.evento], icon: '/icons/pareja-icon-192.png', tag: 'pareja' }
    } else {
      continue
    }

    if (key === row.last_key) {
      unchanged++
      continue
    }

    if (payload) {
      try {
        await sendNotification({ endpoint: row.endpoint, keys: { p256dh: row.p256dh, auth: row.auth } }, JSON.stringify(payload), { TTL: 12 * 3600, urgency: 'normal' })
        sent++
      } catch (e) {
        const code = (e as { statusCode?: number }).statusCode
        if (code === 404 || code === 410) {
          // The device unsubscribed or the browser forgot it: nothing to send to any more.
          await admin.from('push_subscriptions').delete().eq('id', row.id)
          dropped++
          continue
        }
        failures.push(`${row.id}: ${code ?? 'error'}`)
        continue // leave last_key as it was, so the next run tries again
      }
    }
    await admin.from('push_subscriptions').update({ last_key: key }).eq('id', row.id)
  }

  return { today, sent, unchanged, dropped, failures }
}
