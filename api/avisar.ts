import { adminParaAvisos, enviarAvisos, SUBSCRIPTION_COLUMNS, type SubscriptionRow } from './_lib/enviar.js'

// On-the-spot notifications. When she logs her period the app calls this right after saving, so her partner
// hears about it now instead of at the next morning's cron. Authenticated with her JWT (as api/traspaso.ts) and
// limited to her own devices and those of her partner links; it reuses the cron's logic (api/_lib/enviar.ts), so
// each device gets at most one notification per state change, whichever of the two runs first. D10 holds: the
// partner's key never encodes a late period, and nothing here says when she logged it.

export async function POST(request: Request): Promise<Response> {
  const jwt = request.headers.get('authorization')?.replace(/^Bearer /, '')
  if (!jwt) return Response.json({ error: 'unauthorized' }, { status: 401 })

  const admin = adminParaAvisos()
  if (!admin) return Response.json({ error: 'not_configured' }, { status: 503 })

  const { data: who } = await admin.auth.getUser(jwt)
  const userId = who.user?.id
  if (!userId) return Response.json({ error: 'unauthorized' }, { status: 401 })

  const { data: links, error: linksError } = await admin.from('partner_links').select('id').eq('user_id', userId)
  if (linksError) return Response.json({ error: 'failed', detail: linksError.message }, { status: 500 })
  const linkIds = (links ?? []).map((l) => l.id as string)

  const filter = linkIds.length > 0 ? `user_id.eq.${userId},partner_link_id.in.(${linkIds.join(',')})` : `user_id.eq.${userId}`
  const { data: subs, error } = await admin.from('push_subscriptions').select(SUBSCRIPTION_COLUMNS).or(filter)
  if (error) return Response.json({ error: 'failed', detail: error.message }, { status: 500 })

  const result = await enviarAvisos(admin, (subs ?? []) as SubscriptionRow[])
  return Response.json(result, { headers: { 'cache-control': 'no-store' } })
}
