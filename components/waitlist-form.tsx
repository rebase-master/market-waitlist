'use client'

import { useEffect, useState } from 'react'
import { FINANCING_PURPOSES, REFERRAL_SOURCES, parseWaitlist } from '@/lib/validation'
import type { FormContent } from '@/lib/content'

type Status = 'idle' | 'sending' | 'done' | 'error'

const STORAGE_KEY = 'amanah_waitlist'

const inputClass =
  'h-[52px] w-full rounded-xl border border-black/10 bg-white px-4 text-[16px] text-ink outline-none placeholder:text-ink-muted/70 focus-visible:border-focus focus-visible:ring-2 focus-visible:ring-focus/60'
const labelClass = 'mb-1.5 block text-sm font-medium text-ink'

export function WaitlistForm({ content }: { content: FormContent }) {
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [referralSource, setReferralSource] = useState('')
  const [financingPurpose, setFinancingPurpose] = useState('')
  const [website, setWebsite] = useState('') // honeypot

  const [status, setStatus] = useState<Status>('idle')
  const [errorKeys, setErrorKeys] = useState<Record<string, boolean>>({})
  const [banner, setBanner] = useState(false)
  const [refCode, setRefCode] = useState('')
  const [returning, setReturning] = useState(false)
  // localStorage is client-only, so the server can't know if this visitor already
  // joined. Gate on `mounted` and show a skeleton until we've checked — otherwise a
  // returning visitor sees the form flash before the success card on every refresh.
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY)
      if (saved) {
        setRefCode(saved)
        setReturning(true)
        setStatus('done')
      }
    } catch {
      // private mode: the form reappears on reload; the server dedupes anyway.
    } finally {
      setMounted(true)
    }
  }, [])

  if (!mounted) return <FormSkeleton />

  // Localized message for a field error, keyed by the parseWaitlist / server key.
  const err = (key: keyof FormContent['errors']) =>
    errorKeys[key] ? content.errors[key] : undefined

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (status === 'sending') return

    const raw = { fullName, email, phone, referralSource, financingPurpose, website }
    const check = parseWaitlist(raw)
    if (!check.ok) {
      setErrorKeys(Object.fromEntries(Object.keys(check.errors).map((k) => [k, true])))
      setStatus('error')
      return
    }

    setErrorKeys({})
    setBanner(false)
    setStatus('sending')

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
        errors?: Record<string, string>
      }
      if (!res.ok) {
        if (data.errors) {
          setErrorKeys(Object.fromEntries(Object.keys(data.errors).map((k) => [k, true])))
          setStatus('error')
          return
        }
        throw new Error('server')
      }
      const code = data.refCode ?? ''
      setRefCode(code)
      try {
        if (code) window.localStorage.setItem(STORAGE_KEY, code)
      } catch {
        /* ignore storage failures */
      }
      setStatus('done')
    } catch {
      setBanner(true)
      setStatus('error')
    }
  }

  if (status === 'done') {
    const origin = typeof window !== 'undefined' ? window.location.origin : ''
    const shareUrl = refCode ? `${origin}/?ref=${refCode}` : origin
    const waHref = `https://wa.me/?text=${encodeURIComponent(content.shareText.replace('{url}', shareUrl))}`

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
              {returning ? content.successReturning : content.successTitle}
            </p>
            <p className="mt-1 text-[15px] leading-relaxed text-ink-muted">{content.successBody}</p>
          </div>
        </div>
        <a
          href={waHref}
          target="_blank"
          rel="noopener noreferrer"
          // #11813F: WhatsApp-family green that clears WCAG AA for white 16px text
          // (4.96:1; the brighter #1FA855 measured 3.09:1 and failed Lighthouse a11y).
          className="mt-5 flex h-[52px] w-full items-center justify-center gap-2 rounded-full bg-[#11813F] px-5 font-display text-[16px] font-semibold text-white transition-transform active:scale-[0.99]"
        >
          {content.share}
        </a>
        <p className="mt-2 text-center text-[13px] text-ink-muted">{content.shareHint}</p>
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
            {content.fullName}
          </label>
          <input
            id="fullName"
            name="fullName"
            type="text"
            autoComplete="name"
            maxLength={120}
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            aria-invalid={errorKeys.fullName || undefined}
            className={inputClass}
            placeholder={content.fullNamePlaceholder}
          />
          {err('fullName') && <FieldError>{err('fullName')}</FieldError>}
        </div>

        <div>
          <label htmlFor="phone" className={labelClass}>
            {content.phone}
          </label>
          <input
            id="phone"
            name="phone"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            dir="ltr"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            aria-invalid={errorKeys.phone || undefined}
            className={inputClass}
            placeholder={content.phonePlaceholder}
          />
          {err('phone') ? (
            <FieldError>{err('phone')}</FieldError>
          ) : (
            <p className="mt-1.5 text-[13px] text-ink-muted">{content.phoneHint}</p>
          )}
        </div>

        <div>
          <label htmlFor="email" className={labelClass}>
            {content.email} <span className="font-normal text-ink-muted">{content.emailOptional}</span>
          </label>
          <input
            id="email"
            name="email"
            type="email"
            inputMode="email"
            autoComplete="email"
            dir="ltr"
            maxLength={254}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            aria-invalid={errorKeys.email || undefined}
            className={inputClass}
            placeholder={content.emailPlaceholder}
          />
          {err('email') && <FieldError>{err('email')}</FieldError>}
        </div>

        {err('contact') && <FieldError>{err('contact')}</FieldError>}

        <div>
          <label htmlFor="referralSource" className={labelClass}>
            {content.referral}
          </label>
          <select
            id="referralSource"
            name="referralSource"
            value={referralSource}
            onChange={(e) => setReferralSource(e.target.value)}
            aria-invalid={errorKeys.referralSource || undefined}
            className={inputClass}
          >
            <option value="" disabled>
              {content.referralPlaceholder}
            </option>
            {REFERRAL_SOURCES.map((s) => (
              <option key={s} value={s}>
                {content.referralOptions[s]}
              </option>
            ))}
          </select>
          {err('referralSource') && <FieldError>{err('referralSource')}</FieldError>}
        </div>

        <div>
          <label htmlFor="financingPurpose" className={labelClass}>
            {content.purpose}{' '}
            <span className="font-normal text-ink-muted">{content.purposeOptional}</span>
          </label>
          <select
            id="financingPurpose"
            name="financingPurpose"
            value={financingPurpose}
            onChange={(e) => setFinancingPurpose(e.target.value)}
            className={inputClass}
          >
            <option value="">{content.purposePreferNot}</option>
            {FINANCING_PURPOSES.map((p) => (
              <option key={p} value={p}>
                {content.purposeOptions[p]}
              </option>
            ))}
          </select>
        </div>

        {banner && (
          <p role="alert" className="rounded-xl bg-error/10 px-4 py-3 text-sm font-medium text-error">
            {content.errors.server}
          </p>
        )}

        <button
          type="submit"
          disabled={status === 'sending'}
          className="flex h-[52px] w-full items-center justify-center gap-2 rounded-full bg-ink px-5 font-display text-[16px] font-semibold text-white transition-transform active:scale-[0.99] disabled:opacity-70"
        >
          {status === 'sending' ? (
            <>
              <Spinner /> {content.ctaSending}
            </>
          ) : (
            content.cta
          )}
        </button>

        <p className="text-center text-[13px] text-ink-muted">{content.microcopy}</p>
      </div>
    </form>
  )
}

// Shown until we've read localStorage — matches the form's shape so a returning
// visitor never sees the form, and a new visitor gets a graceful loading state
// instead of a layout jump.
function FormSkeleton() {
  return (
    <div
      aria-hidden
      className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-black/5 sm:p-6"
    >
      <div className="flex animate-pulse flex-col gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i}>
            <div className="mb-1.5 h-3.5 w-24 rounded bg-black/10" />
            <div className="h-[52px] w-full rounded-xl bg-black/[0.06]" />
          </div>
        ))}
        <div className="mt-1 h-[52px] w-full rounded-full bg-black/10" />
      </div>
    </div>
  )
}

function FieldError({ children }: { children: React.ReactNode }) {
  return (
    <p role="alert" className="mt-1.5 text-[13px] font-medium text-error">
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
