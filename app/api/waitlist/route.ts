import { NextResponse } from 'next/server'
import { parseWaitlist } from '@/lib/validation'
import { conflictTarget, isUniqueViolation } from '@/lib/db-errors'
import { createServiceClient, hasSupabaseEnv } from '@/lib/supabase'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const strOrNull = (v: unknown) => (typeof v === 'string' && v.trim() !== '' ? v.trim() : null)

export async function POST(req: Request) {
  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request.' }, { status: 400 })
  }

  // Validation boundary — the client mirrors this, but the server is authoritative.
  const parsed = parseWaitlist(body)
  if (!parsed.ok) {
    return NextResponse.json({ errors: parsed.errors }, { status: 400 })
  }

  // Honeypot tripped: return the ordinary success shape and write nothing. Telling a
  // bot it was caught only teaches it to adapt; the log line is the only signal.
  if (parsed.honeypot) {
    console.warn('waitlist: honeypot rejection')
    return NextResponse.json({ ok: true, refCode: null })
  }

  if (!hasSupabaseEnv()) {
    return NextResponse.json(
      { error: 'The waitlist isn’t configured yet. Please try again later.' },
      { status: 503 },
    )
  }

  const v = parsed.value
  const b = (body ?? {}) as Record<string, unknown>
  const row = {
    full_name: v.full_name,
    email: v.email,
    phone: v.phone,
    referral_source: v.referral_source,
    financing_purpose: v.financing_purpose,
    referred_by: v.referred_by,
    utm_source: strOrNull(b.utmSource),
    utm_medium: strOrNull(b.utmMedium),
    utm_campaign: strOrNull(b.utmCampaign),
    // market + ref_code use their DB defaults ('EG' / generated code).
  }

  const supabase = createServiceClient()

  // Two partial unique indexes can't share one ON CONFLICT arbiter, so we INSERT and
  // branch on the 23505 constraint. ref_code collisions retry (new DB-generated code);
  // an email/phone dupe is a returning user — return their EXISTING code so the share
  // link is live, in the identical success shape (no enumeration).
  for (let attempt = 0; attempt < 3; attempt++) {
    const { data, error } = await supabase
      .from('waitlist_signups')
      .insert(row)
      .select('ref_code')
      .single()

    if (!error) {
      return NextResponse.json({ ok: true, refCode: data.ref_code })
    }

    if (isUniqueViolation(error)) {
      const target = conflictTarget(error)
      if (target === 'ref_code') continue // regenerate on the next attempt

      if (target === 'email' || target === 'phone') {
        const value = target === 'phone' ? v.phone : v.email
        if (value) {
          const { data: existing } = await supabase
            .from('waitlist_signups')
            .select('ref_code')
            .eq(target, value)
            .maybeSingle()
          return NextResponse.json({ ok: true, refCode: existing?.ref_code ?? null })
        }
      }
    }

    console.error('waitlist insert failed:', error)
    return NextResponse.json(
      { error: 'Could not save your details. Please try again in a moment.' },
      { status: 500 },
    )
  }

  return NextResponse.json(
    { error: 'Could not save your details. Please try again.' },
    { status: 500 },
  )
}
