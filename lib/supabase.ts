import { createClient, type SupabaseClient } from '@supabase/supabase-js'

// Server-only. This client uses the service-role key, which bypasses Row Level
// Security — it must never be imported into a Client Component or shipped to the
// browser. Only the /api/waitlist route handler uses it.

export function hasSupabaseEnv(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY,
  )
}

export function createServiceClient(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) {
    throw new Error('Supabase env not configured (need NEXT_PUBLIC_SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY).')
  }
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
}
