import { createClient } from '@supabase/supabase-js'

// Session hand-off to the iPhone home screen app. iOS gives the installed app its own storage, so the session she has
// in Safari doesn't come along. Signed in, she asks for a one-time sign-in token (the same kind as a magic link, but
// not emailed) that goes in the installed app's start_url; the app redeems it on first launch for a session of its own.
// Needs SUPABASE_SERVICE_ROLE_KEY in Vercel: generating the token is an admin call.

export async function POST(request: Request): Promise<Response> {
  const url = process.env.VITE_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !serviceKey) return Response.json({ error: 'not_configured' }, { status: 503 })

  const jwt = request.headers.get('authorization')?.replace(/^Bearer /, '')
  if (!jwt) return Response.json({ error: 'unauthorized' }, { status: 401 })

  const admin = createClient(url, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } })
  const { data: who } = await admin.auth.getUser(jwt)
  const email = who.user?.email
  if (!email) return Response.json({ error: 'unauthorized' }, { status: 401 })

  const { data, error } = await admin.auth.admin.generateLink({ type: 'magiclink', email })
  if (error) return Response.json({ error: 'failed' }, { status: 500 })
  return Response.json({ token: data.properties.hashed_token }, { headers: { 'cache-control': 'no-store' } })
}
