import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined
const key = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined

if (!url || !key) {
  // A build without these would otherwise be a blank page (it happened on the first Vercel preview).
  const root = document.getElementById('root')
  if (root) {
    root.innerHTML =
      '<p style="max-width:420px;margin:80px auto;padding:0 16px;font:700 17px/1.4 Nunito,system-ui,sans-serif;text-align:center">' +
      'Gimme Gold no está bien configurado: faltan VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY en este despliegue.</p>'
  }
  throw new Error('Faltan VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY (ver .env.example)')
}

export const supabase = createClient(url, key)
