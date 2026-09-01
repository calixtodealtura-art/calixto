import type { MetadataRoute } from 'next'

const BASE_URL = 'https://calixto.ar'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow:     '/',
      disallow: [
        '/admin',
        '/admin/',
        '/checkout',
        '/cuenta',
        '/mis-pedidos',
        '/orden-confirmada',
        '/api/',
      ],
    },
    sitemap: `${BASE_URL}/sitemap.xml`,
  }
}
