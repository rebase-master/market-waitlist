import { WaitlistForm } from '@/components/waitlist-form'

const TRUST = [
  {
    title: 'No riba, ever',
    body: 'Financing structured on Murabaha — a transparent profit rate, never interest.',
  },
  {
    title: 'One clear fee',
    body: 'A single admin fee, shown upfront. No compounding, no hidden costs.',
  },
  {
    title: 'Built for mobile money',
    body: 'Works with Vodafone Cash, InstaPay, and Fawry — no bank account needed.',
  },
]

const FAQ = [
  {
    q: 'Is this really interest-free?',
    a: 'Yes. Amanah uses Shariah-compliant structures such as Murabaha — a fixed, transparent profit or admin fee agreed upfront, never riba (interest).',
  },
  {
    q: 'When does it launch in Egypt?',
    a: 'We’re rolling out in phases. Join the waitlist and we’ll message you the moment early access opens in your area.',
  },
  {
    q: 'How is my data used?',
    a: 'Only to contact you about early access. We don’t sell your details or send marketing spam.',
  },
]

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://amanah.example.com'

// Organization + WebPage only — deliberately NOT FinancialService, which would
// over-claim a licensed status the disclaimer explicitly denies.
const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Organization',
      '@id': `${siteUrl}/#organization`,
      name: 'Amanah',
      url: siteUrl,
      description: 'Shariah-compliant, interest-free consumer financing for Egypt.',
      areaServed: { '@type': 'Country', name: 'Egypt' },
    },
    {
      '@type': 'WebPage',
      '@id': `${siteUrl}/#webpage`,
      url: `${siteUrl}/`,
      name: 'Amanah — Shariah-compliant financing for Egypt',
      description:
        'Halal, interest-free financing built for Egypt. Join the waitlist for early access.',
      inLanguage: 'en-EG',
      isPartOf: { '@id': `${siteUrl}/#organization` },
      about: { '@id': `${siteUrl}/#organization` },
    },
  ],
}

export default function Home() {
  return (
    <div className="relative min-h-dvh overflow-hidden">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {/* Restrained aurora glow — decorative, sits behind the form, never under text. */}
      <div
        aria-hidden
        className="aurora pointer-events-none absolute -top-24 right-[-12%] h-[440px] w-[440px] rounded-full opacity-30 blur-3xl"
      />

      <main className="relative mx-auto w-full max-w-6xl px-5 py-6 sm:px-8 sm:py-8">
        <header className="flex items-center justify-between">
          <span className="font-display text-xl font-bold tracking-tight text-ink">Amanah</span>
          <a
            href="/ar"
            hrefLang="ar"
            className="rounded-full border border-black/10 px-3 py-1.5 text-sm text-ink transition-colors hover:bg-white/60"
          >
            العربية
          </a>
        </header>

        <section className="mt-10 grid items-start gap-8 sm:mt-14 lg:grid-cols-2 lg:gap-14">
          <div className="lg:pt-6">
            <h1 className="font-display text-4xl font-bold leading-[1.08] text-ink text-balance sm:text-5xl">
              Halal financing, built for Egypt.
            </h1>
            <p className="mt-4 max-w-md text-lg leading-relaxed text-ink-muted">
              Shariah-compliant, interest-free financing you manage from your phone — pay with
              Vodafone Cash, InstaPay, or Fawry. Join the waitlist for early access.
            </p>
            <ul className="mt-6 hidden space-y-2.5 lg:block">
              {TRUST.map((t) => (
                <li key={t.title} className="flex items-start gap-2.5 text-ink">
                  <span aria-hidden className="mt-0.5 font-bold text-focus">
                    ✓
                  </span>
                  <span className="font-medium">{t.title}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="relative">
            <WaitlistForm />
          </div>
        </section>

        <section className="mt-14 grid gap-4 sm:mt-16 sm:grid-cols-3">
          {TRUST.map((t) => (
            <div key={t.title} className="rounded-2xl bg-white/60 p-5 ring-1 ring-black/5">
              <p className="font-display font-bold text-ink">{t.title}</p>
              <p className="mt-1 text-sm leading-relaxed text-ink-muted">{t.body}</p>
            </div>
          ))}
        </section>

        <section className="mt-14 max-w-2xl">
          <h2 className="font-display text-2xl font-bold text-ink">Questions</h2>
          <div className="mt-4 divide-y divide-black/10 overflow-hidden rounded-2xl bg-white/60 ring-1 ring-black/5">
            {FAQ.map((item) => (
              <details key={item.q} className="group px-5 py-4">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-medium text-ink">
                  {item.q}
                  <span
                    aria-hidden
                    className="text-xl text-ink-muted transition-transform group-open:rotate-45"
                  >
                    +
                  </span>
                </summary>
                <p className="mt-2 text-sm leading-relaxed text-ink-muted">{item.a}</p>
              </details>
            ))}
          </div>
        </section>

        <footer className="mt-14 border-t border-black/10 pt-6 pb-10 text-sm text-ink-muted">
          <p className="max-w-2xl">
            Amanah is a waitlist for a product in development — not yet a licensed financial
            service in Egypt. We’ll only contact you about early access.
          </p>
          <p className="mt-3">© 2026 Amanah</p>
        </footer>
      </main>
    </div>
  )
}
