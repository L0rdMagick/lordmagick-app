import type { MetadataRoute } from 'next'
 
export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://lordmagick.com'
  
  // Core routes
  const routes = [
    '',
    '/hall',
    '/spell-room',
    '/oracle-room',
    '/the-magick-psychic-school',
    '/magickal-tools',
    '/grimoire',
    '/store',
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: route === '' ? 1.0 : 0.8,
  }))

  // Sub-routes for Spells
  const spellRoutes = [
    '/spell-room/wiccan',
    '/spell-room/hoodoo-voodoo',
    '/spell-room/electric',
    '/spell-room/grimoire-of-digital-servitors',
    '/spell-room/love-spells-app',
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }))

  // Sub-routes for Oracle
  const oracleRoutes = [
    '/oracle-room/tarot-reading',
    '/oracle-room/human-design',
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }))

  // Sub-routes for School
  const schoolRoutes = [
    '/the-magick-psychic-school/magick-training',
    '/the-magick-psychic-school/psychic-training',
    '/the-magick-psychic-school/psychic-training/geo-viewing',
    '/the-magick-psychic-school/the-magick-library',
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  }))

  // Sub-routes for Tools
  const toolRoutes = [
    '/magickal-tools/electro-magickal-wands',
    '/magickal-tools/energy-work',
    '/magickal-tools/tarot-decks',
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  }))

  return [...routes, ...spellRoutes, ...oracleRoutes, ...schoolRoutes, ...toolRoutes]
}
