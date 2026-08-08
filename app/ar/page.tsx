import type { Metadata } from 'next'
import { WaitlistPage } from '@/components/waitlist-page'
import { AR } from '@/lib/content'

export const metadata: Metadata = {
  title: AR.meta.title,
  description: AR.meta.description,
  alternates: {
    canonical: '/ar',
    languages: {
      'en-EG': '/',
      'ar-EG': '/ar',
      'x-default': '/',
    },
  },
  openGraph: {
    title: AR.meta.title,
    description: AR.meta.description,
    url: '/ar',
    locale: 'ar_EG',
    type: 'website',
  },
  // This page is already in Arabic — the canonical Arabic version. Tell Chrome/Google
  // not to auto-translate it (which mangles the RTL layout and mutates <html>); readers
  // who want another language switch to `/` via the toggle / hreflang.
  other: { google: 'notranslate' },
}

export default function ArabicHome() {
  return <WaitlistPage content={AR} path="/ar" />
}
