import type { Metadata, Viewport } from 'next'
import { inter, outfit } from '@/lib/fonts'
import { SITE_URL as siteUrl } from '@/lib/site'
import '../globals.css'

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

// English root layout. The Arabic route lives under the (ar) group with its own
// root layout, so each locale gets a correct, statically-rendered <html lang>/<dir>
// and build-time <head> metadata (no streaming).
// suppressHydrationWarning: browser translators mutate <html> attrs before React
// hydrates (e.g. Chrome Translate adds `translated-ltr`); this is the documented remedy.
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      dir="ltr"
      className={`${outfit.variable} ${inter.variable}`}
      suppressHydrationWarning
    >
      <body>{children}</body>
    </html>
  )
}
