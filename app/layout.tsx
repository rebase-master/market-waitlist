import type { Metadata, Viewport } from 'next'
import { headers } from 'next/headers'
import { Inter, Outfit } from 'next/font/google'
import { SITE_URL as siteUrl } from '@/lib/site'
import './globals.css'

// Mal's brand faces, self-hosted by next/font (subset + swap) — zero render-blocking cost.
const outfit = Outfit({
  subsets: ['latin'],
  weight: ['600', '700'],
  variable: '--font-outfit',
  display: 'swap',
})

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-inter',
  display: 'swap',
})

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: 'Amanah — Shariah-compliant financing for Egypt | Join the waitlist',
  description:
    'Halal, interest-free financing built for Egypt. No riba, no hidden fees, pay with mobile money. Join the waitlist for early access.',
  openGraph: {
    title: 'Amanah — Shariah-compliant financing for Egypt',
    description:
      'Halal, interest-free financing built for Egypt. Join the waitlist for early access.',
    url: siteUrl,
    siteName: 'Amanah',
    locale: 'en_EG',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Amanah — Shariah-compliant financing for Egypt',
    description: 'Halal, interest-free financing built for Egypt. Join the waitlist.',
  },
  alternates: {
    canonical: '/',
    languages: {
      'en-EG': '/',
      'ar-EG': '/ar',
      'x-default': '/',
    },
  },
  robots: { index: true, follow: true },
}

export const viewport: Viewport = {
  themeColor: '#d0ddee',
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  // Set <html lang>/<dir> per locale so browsers don't mis-detect (and auto-translate)
  // the Arabic page, and so crawlers/screen readers see the right language.
  const pathname = (await headers()).get('x-pathname') ?? '/'
  const isArabic = pathname.startsWith('/ar')

  return (
    // suppressHydrationWarning: browser translators / extensions mutate <html>
    // attributes (e.g. Chrome Translate adds `translated-ltr` and rewrites `lang`)
    // before React hydrates. This is the documented remedy for that class of mismatch.
    <html
      lang={isArabic ? 'ar' : 'en'}
      dir={isArabic ? 'rtl' : 'ltr'}
      className={`${outfit.variable} ${inter.variable}`}
      suppressHydrationWarning
    >
      <body>{children}</body>
    </html>
  )
}
