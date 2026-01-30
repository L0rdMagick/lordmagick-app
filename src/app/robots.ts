import type { MetadataRoute } from 'next'
 
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/private/'], // Protect any private routes if they exist, otherwise standard
    },
    sitemap: 'https://lordmagick.com/sitemap.xml',
  }
}
