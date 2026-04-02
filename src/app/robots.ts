import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  const baseUrlEnv = process.env.SITE_URL || 'https://hospital-liart-mu.vercel.app'
  const baseUrl = baseUrlEnv.endsWith('/') ? baseUrlEnv.slice(0, -1) : baseUrlEnv

  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin/', '/staff/'], // Example: hide private sections from search engines
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  }
}
