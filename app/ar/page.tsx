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
}

export default function ArabicHome() {
  return <WaitlistPage content={AR} path="/ar" />
}
