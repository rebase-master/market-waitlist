import { z } from 'zod'

// Enum values mirror supabase/migrations/0001_init.sql exactly.
export const REFERRAL_SOURCES = [
  'friend_family',
  'facebook',
  'instagram',
  'tiktok',
  'search',
  'news',
  'other',
] as const
export const FINANCING_PURPOSES = [
  'electronics',
  'home_appliances',
  'furniture',
  'education',
  'medical',
  'vehicle',
  'other',
] as const
export type ReferralSource = (typeof REFERRAL_SOURCES)[number]
export type FinancingPurpose = (typeof FINANCING_PURPOSES)[number]

export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i
export const MAX_EMAIL_LENGTH = 254 // RFC 5321

/**
 * Normalize common Egyptian mobile inputs to E.164 (`+20…`), or return null if it
 * is not a valid Egyptian mobile. Accepts the 010/011/012/015 local form, a leading
 * 0, `+20`, `0020`, and the bare (no-leading-0) form, tolerating spaces, dashes,
 * dots, and parens. Egyptian mobiles are `01[0125]` + 8 digits.
 */
export function normalizeEgyptianPhone(raw: string): string | null {
  if (typeof raw !== 'string') return null
  let s = raw.trim().replace(/[\s\-().]/g, '')
  if (s === '') return null

  if (s.startsWith('00')) s = '+' + s.slice(2)

  if (s.startsWith('+20')) {
    // already country-coded
  } else if (s.startsWith('20')) {
    s = '+' + s
  } else if (s.startsWith('0')) {
    s = '+20' + s.slice(1)
  } else if (/^1[0125]/.test(s)) {
    s = '+20' + s
  } else {
    return null
  }

  return /^\+201[0125]\d{8}$/.test(s) ? s : null
}

// Empty strings from an HTML form mean "not provided" — treat them as undefined.
const optionalTrimmed = z
  .string()
  .trim()
  .optional()
  .transform((v) => (v && v.length > 0 ? v : undefined))

export const waitlistInputSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(2, 'Please enter your full name.')
    .max(120, 'That name is too long.'),
  email: optionalTrimmed,
  phone: optionalTrimmed,
  referralSource: z.enum(REFERRAL_SOURCES),
  financingPurpose: z.enum(FINANCING_PURPOSES).optional().catch(undefined),
  referredBy: optionalTrimmed.pipe(z.string().max(32).optional()),
  website: z.string().optional(), // honeypot — must stay empty
})

export type WaitlistInput = z.input<typeof waitlistInputSchema>

/** The normalized, DB-column-shaped result of a valid signup. */
export type WaitlistValue = {
  full_name: string
  email: string | null
  phone: string | null
  referral_source: ReferralSource
  financing_purpose: FinancingPurpose | null
  referred_by: string | null
}

export type ParseResult =
  | { ok: true; value: WaitlistValue; honeypot: boolean }
  | { ok: false; errors: Record<string, string> }

function friendly(key: string, fallback: string): string {
  if (key === 'referralSource') return 'Please choose how you heard about us.'
  return fallback
}

/**
 * Validate + normalize raw form/JSON input. Shared by the client (fast feedback)
 * and the server route (the real boundary). Never throws — returns a typed result.
 */
export function parseWaitlist(raw: unknown): ParseResult {
  const parsed = waitlistInputSchema.safeParse(raw)
  if (!parsed.success) {
    const errors: Record<string, string> = {}
    for (const issue of parsed.error.issues) {
      const key = String(issue.path[0] ?? 'form')
      if (!errors[key]) errors[key] = friendly(key, issue.message)
    }
    return { ok: false, errors }
  }

  const d = parsed.data
  const errors: Record<string, string> = {}

  const email = d.email ? d.email.toLowerCase() : undefined
  if (email && (email.length > MAX_EMAIL_LENGTH || !EMAIL_RE.test(email))) {
    errors.email = 'That email doesn’t look right.'
  }

  let phone: string | undefined
  if (d.phone) {
    const norm = normalizeEgyptianPhone(d.phone)
    if (!norm) errors.phone = 'Enter a valid Egyptian mobile (010, 011, 012, or 015).'
    else phone = norm
  }

  if (!email && !phone) {
    errors.contact = 'Enter an email or a mobile number so we can reach you.'
  }

  if (Object.keys(errors).length > 0) return { ok: false, errors }

  return {
    ok: true,
    honeypot: Boolean(d.website && d.website.trim() !== ''),
    value: {
      full_name: d.fullName,
      email: email ?? null,
      phone: phone ?? null,
      referral_source: d.referralSource,
      financing_purpose: (d.financingPurpose as FinancingPurpose | undefined) ?? null,
      referred_by: d.referredBy ?? null,
    },
  }
}
