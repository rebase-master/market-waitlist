import { Inter, Outfit } from 'next/font/google'

// Mal's brand faces, self-hosted by next/font (subset + swap) — zero render-blocking
// cost. Shared by both root layouts (the (en) and (ar) route groups).
export const outfit = Outfit({
  subsets: ['latin'],
  weight: ['600', '700'],
  variable: '--font-outfit',
  display: 'swap',
})

export const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-inter',
  display: 'swap',
})
