import { adminParaAvisos, enviarAvisos, SUBSCRIPTION_COLUMNS, type SubscriptionRow } from './_lib/enviar.js'

// The daily notifications run (vercel.json "crons"): goes through every subscribed device and sends whatever
// changed since it was last notified (api/_lib/enviar.ts). Needs CRON_SECRET in Vercel, plus what enviar.ts needs.

export async function GET(request: Request): Promise<Response> {
  const secret = process.env.CRON_SECRET
  if (!secret || request.headers.get('authorization') !== `Bearer ${secret}`) {
    return Response.json({ error: 'unauthorized' }, { status: 401 })
  }
  const admin = adminParaAvisos()
  if (!admin) return Response.json({ error: 'not_configured' }, { status: 503 })

  const { data: subs, error } = await admin.from('push_subscriptions').select(SUBSCRIPTION_COLUMNS)
  if (error) return Response.json({ error: 'failed', detail: error.message }, { status: 500 })

  const result = await enviarAvisos(admin, (subs ?? []) as SubscriptionRow[])
  return Response.json(result, { headers: { 'cache-control': 'no-store' } })
}
