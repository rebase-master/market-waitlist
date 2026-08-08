import type { MetadataRoute } from 'next'
import { SITE_URL as siteUrl } from '@/lib/site'

const languages = {
  'en-EG': `${siteUrl}/`,
  'ar-EG': `${siteUrl}/ar`,
}

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date()
  return [
    {
      url: `${siteUrl}/`,
      lastModified,
      changeFrequency: 'weekly',
      priority: 1,
      alternates: { languages },
    },
    {
      url: `${siteUrl}/ar`,
      lastModified,
      changeFrequency: 'weekly',
      priority: 0.9,
      alternates: { languages },
    },
  ]
}
