import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.SITE_URL || 'https://hospital-liart-mu.vercel.app'
  
  // Define the core routes of your application
  const routes = [
    '',
    '/login',
    '/forgotPassword',
    '/admin',
    '/staff',
    '/chat',
  ]

  return routes.map((route) => ({
    url: `${baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl}${route === '' ? '' : route}`,
    lastModified: new Date(),
    changeFrequency: 'daily', // You can adjust this based on your needs
    priority: route === '' ? 1 : 0.8,
  }))
}
