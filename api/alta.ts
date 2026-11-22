import { createClient } from '@supabase/supabase-js'

// A mail to the owner each time someone finishes signing up. The database calls this from a trigger on
// public.profiles (supabase/migrations/0006_aviso_alta.sql), which fires once she has accepted the health consent,
// so an account that never gets that far doesn't count. The call carries nothing about her: this function counts
// the profiles itself and the mail says only that there is one more and how many there are now. No email address,
// no cycle data. Needs ALTA_SECRET (the same value stored in Supabase Vault), RESEND_API_KEY and ALTA_AVISO_PARA
// in Vercel, plus SUPABASE_SERVICE_ROLE_KEY. ALTA_AVISO_DE is optional: without a verified domain Resend only
// lets its test sender write to the address the Resend account was opened with.

const REMITENTE_DE_PRUEBA = 'Gimme Gold <onboarding@resend.dev>'

export async function POST(request: Request): Promise<Response> {
  const secret = process.env.ALTA_SECRET
  if (!secret || request.headers.get('authorization') !== `Bearer ${secret}`) {
    return Response.json({ error: 'unauthorized' }, { status: 401 })
  }

  const url = process.env.VITE_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  const resendKey = process.env.RESEND_API_KEY
  const para = process.env.ALTA_AVISO_PARA
  if (!url || !serviceKey || !resendKey || !para) return Response.json({ error: 'not_configured' }, { status: 503 })

  const admin = createClient(url, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } })
  const { count, error } = await admin.from('profiles').select('*', { count: 'exact', head: true })
  if (error || count === null) return Response.json({ error: 'failed', detail: error?.message }, { status: 500 })

  const sent = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { authorization: `Bearer ${resendKey}`, 'content-type': 'application/json' },
    body: JSON.stringify({
      from: process.env.ALTA_AVISO_DE || REMITENTE_DE_PRUEBA,
      to: [para],
      subject: `Nueva alta en Gimme Gold (ya son ${count})`,
      text: `Alguien acaba de completar el alta en Gimme Gold.\n\nCon esta ya son ${count} ${count === 1 ? 'usuaria' : 'usuarias'} con el alta completa.\n`,
    }),
  })
  if (!sent.ok) {
    return Response.json({ error: 'mail_failed', status: sent.status, detail: await sent.text() }, { status: 502 })
  }
  return Response.json({ sent: true, total: count }, { headers: { 'cache-control': 'no-store' } })
}
