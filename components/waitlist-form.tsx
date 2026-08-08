'use client'

import { useEffect, useState } from 'react'
import {
  FINANCING_PURPOSES,
  REFERRAL_SOURCES,
  parseWaitlist,
  type FinancingPurpose,
  type ReferralSource,
} from '@/lib/validation'

type Status = 'idle' | 'sending' | 'done' | 'error'

const REFERRAL_LABELS: Record<ReferralSource, string> = {
  friend_family: 'A friend or family member',
  facebook: 'Facebook',
  instagram: 'Instagram',
  tiktok: 'TikTok',
  search: 'Google / search',
  news: 'A news site or blog',
  other: 'Somewhere else',
}

const PURPOSE_LABELS: Record<FinancingPurpose, string> = {
  electronics: 'Electronics (phone, laptop)',
  home_appliances: 'Home appliances',
  furniture: 'Furniture',
  education: 'Education / tuition',
  medical: 'Medical',
  vehicle: 'Vehicle',
  other: 'Something else',
}

const STORAGE_KEY = 'amanah_waitlist'

const inputClass =
  'h-[52px] w-full rounded-xl border border-black/10 bg-white px-4 text-[16px] text-ink outline-none placeholder:text-ink-muted/70 focus-visible:border-focus focus-visible:ring-2 focus-visible:ring-focus/60'
const labelClass = 'mb-1.5 block text-sm font-medium text-ink'

export function WaitlistForm() {
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [referralSource, setReferralSource] = useState('')
  const [financingPurpose, setFinancingPurpose] = useState('')
  const [website, setWebsite] = useState('') // honeypot

  const [status, setStatus] = useState<Status>('idle')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [banner, setBanner] = useState('')
  const [refCode, setRefCode] = useState('')
  const [returning, setReturning] = useState(false)

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY)
      if (saved) {
        setRefCode(saved)
        setReturning(true)
        setStatus('done')
      }
    } catch {
      // private mode: the form just shows again on reload; the server dedupes anyway.
    }
  }, [])

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (status === 'sending') return

    const raw = { fullName, email, phone, referralSource, financingPurpose, website }
    const check = parseWaitlist(raw)
    if (!check.ok) {
      setErrors(check.errors)
      setStatus('error')
      return
    }

    setErrors({})
    setBanner('')
    setStatus('sending')

    // Attribution captured from the URL: ?ref= referral code + any UTM params.
    const params = new URLSearchParams(window.location.search)
    const payload = {
      ...raw,
      referredBy: params.get('ref') ?? undefined,
      utmSource: params.get('utm_source') ?? undefined,
      utmMedium: params.get('utm_medium') ?? undefined,
      utmCampaign: params.get('utm_campaign') ?? undefined,
    }

    try {
      const res = await fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const data = (await res.json().catch(() => ({}))) as {
        refCode?: string
        error?: string
        errors?: Record<string, string>
      }
      if (!res.ok) {
        if (data.errors) {
          setErrors(data.errors)
          setStatus('error')
          return
        }
        throw new Error(data.error ?? 'Could not save your details. Please try again.')
      }
      const code = data.refCode ?? ''
      setRefCode(code)
      try {
        if (code) window.localStorage.setItem(STORAGE_KEY, code)
      } catch {
        /* ignore storage failures */
      }
      setStatus('done')
    } catch (err) {
      setBanner(err instanceof Error ? err.message : 'Could not save your details.')
      setStatus('error')
    }
  }

  if (status === 'done') {
    const origin = typeof window !== 'undefined' ? window.location.origin : ''
    const shareUrl = refCode ? `${origin}/?ref=${refCode}` : origin
    const shareText =
      `أنا انضممت لقائمة انتظار أمانة — تمويل حلال بدون فوائد. انضم لي:\n` +
      `I just joined the Amanah waitlist — halal, interest-free financing for Egypt. Join me: ${shareUrl}`
    const waHref = `https://wa.me/?text=${encodeURIComponent(shareText)}`

    return (
      <div role="status" className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-black/5">
        <div className="flex items-start gap-3">
          <span
            aria-hidden
            className="grid size-7 flex-none place-items-center rounded-full bg-ink text-[15px] font-bold text-white"
          >
            ✓
          </span>
          <div>
            <p className="font-display text-lg font-bold text-ink">
              {returning ? 'You’re already on the list.' : 'You’re on the list.'}
            </p>
            <p className="mt-1 text-[15px] leading-relaxed text-ink-muted">
              We’ll message you when early access opens in Egypt.
            </p>
          </div>
        </div>
        <a
          href={waHref}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-5 flex h-[52px] w-full items-center justify-center gap-2 rounded-full bg-[#1FA855] px-5 font-display text-[16px] font-semibold text-white transition-transform active:scale-[0.99]"
        >
          Share on WhatsApp
        </a>
        <p className="mt-2 text-center text-[13px] text-ink-muted">
          Move up the list — invite a friend.
        </p>
      </div>
    )
  }

  return (
    <form
      onSubmit={onSubmit}
      noValidate
      className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-black/5 sm:p-6"
    >
      {/* Honeypot: off-screen, out of the tab order and a11y tree. Only a bot fills it. */}
      <div aria-hidden className="pointer-events-none absolute left-[-9999px] h-0 w-0 overflow-hidden">
        <label htmlFor="company-website">Leave this field empty</label>
        <input
          id="company-website"
          name="website"
          type="text"
          tabIndex={-1}
          autoComplete="nope"
          value={website}
          onChange={(e) => setWebsite(e.target.value)}
        />
      </div>

      <div className="flex flex-col gap-4">
        <div>
          <label htmlFor="fullName" className={labelClass}>
            Full name
          </label>
          <input
            id="fullName"
            name="fullName"
            type="text"
            autoComplete="name"
            maxLength={120}
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            aria-invalid={Boolean(errors.fullName) || undefined}
            className={inputClass}
            placeholder="Your name"
          />
          {errors.fullName && <FieldError id="err-fullName">{errors.fullName}</FieldError>}
        </div>

        <div>
          <label htmlFor="phone" className={labelClass}>
            Mobile number
          </label>
          <input
            id="phone"
            name="phone"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            aria-invalid={Boolean(errors.phone) || undefined}
            className={inputClass}
            placeholder="010 1234 5678"
          />
          {errors.phone && <FieldError id="err-phone">{errors.phone}</FieldError>}
        </div>

        <div>
          <label htmlFor="email" className={labelClass}>
            Email <span className="font-normal text-ink-muted">(optional if you gave a number)</span>
          </label>
          <input
            id="email"
            name="email"
            type="email"
            inputMode="email"
            autoComplete="email"
            maxLength={254}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            aria-invalid={Boolean(errors.email) || undefined}
            className={inputClass}
            placeholder="you@email.com"
          />
          {errors.email && <FieldError id="err-email">{errors.email}</FieldError>}
        </div>

        {errors.contact && <FieldError id="err-contact">{errors.contact}</FieldError>}

        <div>
          <label htmlFor="referralSource" className={labelClass}>
            How did you hear about us?
          </label>
          <select
            id="referralSource"
            name="referralSource"
            value={referralSource}
            onChange={(e) => setReferralSource(e.target.value)}
            aria-invalid={Boolean(errors.referralSource) || undefined}
            className={inputClass}
          >
            <option value="" disabled>
              Choose one…
            </option>
            {REFERRAL_SOURCES.map((s) => (
              <option key={s} value={s}>
                {REFERRAL_LABELS[s]}
              </option>
            ))}
          </select>
          {errors.referralSource && (
            <FieldError id="err-referralSource">{errors.referralSource}</FieldError>
          )}
        </div>

        <div>
          <label htmlFor="financingPurpose" className={labelClass}>
            What would you use financing for?{' '}
            <span className="font-normal text-ink-muted">(optional)</span>
          </label>
          <select
            id="financingPurpose"
            name="financingPurpose"
            value={financingPurpose}
            onChange={(e) => setFinancingPurpose(e.target.value)}
            className={inputClass}
          >
            <option value="">Prefer not to say</option>
            {FINANCING_PURPOSES.map((p) => (
              <option key={p} value={p}>
                {PURPOSE_LABELS[p]}
              </option>
            ))}
          </select>
        </div>

        {banner && (
          <p role="alert" className="rounded-xl bg-error/10 px-4 py-3 text-sm font-medium text-error">
            {banner}
          </p>
        )}

        <button
          type="submit"
          disabled={status === 'sending'}
          className="flex h-[52px] w-full items-center justify-center gap-2 rounded-full bg-ink px-5 font-display text-[16px] font-semibold text-white transition-transform active:scale-[0.99] disabled:opacity-70"
        >
          {status === 'sending' ? (
            <>
              <Spinner /> Adding you…
            </>
          ) : (
            'Join the waitlist'
          )}
        </button>

        <p className="text-center text-[13px] text-ink-muted">
          No spam. We’ll only message you about early access.
        </p>
      </div>
    </form>
  )
}

function FieldError({ id, children }: { id: string; children: React.ReactNode }) {
  return (
    <p id={id} role="alert" className="mt-1.5 text-[13px] font-medium text-error">
      {children}
    </p>
  )
}

function Spinner() {
  return (
    <span
      aria-hidden
      className="size-4 animate-spin rounded-full border-2 border-white/40 border-t-white"
    />
  )
}
