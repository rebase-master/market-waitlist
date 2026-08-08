import { WaitlistForm } from '@/components/waitlist-form'
import type { Content } from '@/lib/content'
import { SITE_URL as siteUrl } from '@/lib/site'

// Shared page body for both / (English) and /ar (Arabic). Language comes entirely
// from `content`; direction is set via dir on the wrapper and CSS logical properties
// (start/end) so the same markup mirrors for RTL with no duplicated styles.
export function WaitlistPage({ content, path }: { content: Content; path: string }) {
  // Organization + WebPage only — never FinancialService (would over-claim a licence).
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
        '@id': `${siteUrl}${path}#webpage`,
        url: `${siteUrl}${path}`,
        name: content.meta.title,
        description: content.meta.description,
        inLanguage: content.meta.inLanguage,
        isPartOf: { '@id': `${siteUrl}/#organization` },
        about: { '@id': `${siteUrl}/#organization` },
      },
    ],
  }

  return (
    <div lang={content.lang} dir={content.dir} className="relative min-h-dvh overflow-hidden">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {/* Restrained aurora glow — decorative, mirrors with the layout (logical `end`). */}
      <div
        aria-hidden
        className="aurora pointer-events-none absolute -top-24 end-[-12%] h-[440px] w-[440px] rounded-full opacity-30 blur-3xl"
      />

      <main className="relative mx-auto w-full max-w-6xl px-5 py-6 sm:px-8 sm:py-8">
        <header className="flex items-center justify-between">
          <span className="font-display text-xl font-bold tracking-tight text-ink">
            {content.lang === 'ar' ? 'أمانة' : 'Amanah'}
          </span>
          <a
            href={content.langSwitch.href}
            hrefLang={content.langSwitch.href === '/ar' ? 'ar' : 'en'}
            className="rounded-full border border-black/10 px-3 py-1.5 text-sm text-ink transition-colors hover:bg-white/60"
          >
            {content.langSwitch.label}
          </a>
        </header>

        <section className="mt-10 grid items-start gap-8 sm:mt-14 lg:grid-cols-2 lg:gap-14">
          <div className="lg:pt-6">
            <h1 className="font-display text-4xl font-bold leading-[1.08] text-ink text-balance sm:text-5xl">
              {content.hero.title}
            </h1>
            <p className="mt-4 max-w-md text-lg leading-relaxed text-ink-muted">
              {content.hero.subline}
            </p>
            <ul className="mt-6 hidden space-y-2.5 lg:block">
              {content.hero.trust.map((t) => (
                <li key={t} className="flex items-start gap-2.5 text-ink">
                  <span aria-hidden className="mt-0.5 font-bold text-focus">
                    ✓
                  </span>
                  <span className="font-medium">{t}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="relative">
            <WaitlistForm content={content.form} />
          </div>
        </section>

        <section className="mt-14 grid gap-4 sm:mt-16 sm:grid-cols-3">
          {content.trust.map((t) => (
            <div key={t.title} className="rounded-2xl bg-white/60 p-5 ring-1 ring-black/5">
              <p className="font-display font-bold text-ink">{t.title}</p>
              <p className="mt-1 text-sm leading-relaxed text-ink-muted">{t.body}</p>
            </div>
          ))}
        </section>

        <section className="mt-14 max-w-2xl">
          <h2 className="font-display text-2xl font-bold text-ink">{content.faqTitle}</h2>
          <div className="mt-4 divide-y divide-black/10 overflow-hidden rounded-2xl bg-white/60 ring-1 ring-black/5">
            {content.faq.map((item) => (
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
          <p className="max-w-2xl">{content.disclaimer}</p>
          <p className="mt-3">{content.copyright}</p>
        </footer>
      </main>
    </div>
  )
}
