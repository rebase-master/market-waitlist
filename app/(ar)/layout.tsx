import type { Metadata, Viewport } from 'next'
import { inter, outfit } from '@/lib/fonts'
import { SITE_URL as siteUrl } from '@/lib/site'
import '../globals.css'

// Title/description/canonical/OG live on the /ar page itself; the layout carries
// the shared base config.
export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  robots: { index: true, follow: true },
}

export const viewport: Viewport = {
  themeColor: '#d0ddee',
}

// Arabic root layout: statically renders <html lang="ar" dir="rtl"> so browsers,
// crawlers, and screen readers see the right language without any runtime work.
// suppressHydrationWarning: browser translators mutate <html> attrs before hydration.
export default function ArabicRootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="ar"
      dir="rtl"
      className={`${outfit.variable} ${inter.variable}`}
      suppressHydrationWarning
    >
      <body>{children}</body>
    </html>
  )
}
