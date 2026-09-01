import type { MetadataRoute } from 'next'
import { getProducts, getComboSlugs } from '@/lib/firestore'

const BASE_URL = 'https://calixto.ar'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [products, comboSlugs] = await Promise.all([
    getProducts().catch(() => []),
    getComboSlugs().catch(() => []),
  ])

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${BASE_URL}/`,           changeFrequency: 'weekly',  priority: 1   },
    { url: `${BASE_URL}/productos`,  changeFrequency: 'daily',   priority: 0.9 },
    { url: `${BASE_URL}/imperdibles`, changeFrequency: 'daily',  priority: 0.7 },
    { url: `${BASE_URL}/nosotros`,   changeFrequency: 'monthly', priority: 0.5 },
    { url: `${BASE_URL}/contacto`,   changeFrequency: 'monthly', priority: 0.5 },
  ]

  const productRoutes: MetadataRoute.Sitemap = products.map(product => ({
    url:            `${BASE_URL}/producto/${product.slug}`,
    lastModified:   product.createdAt,
    changeFrequency: 'weekly',
    priority:        0.8,
  }))

  const comboRoutes: MetadataRoute.Sitemap = comboSlugs.map(slug => ({
    url:             `${BASE_URL}/imperdibles/${slug}`,
    changeFrequency: 'weekly',
    priority:        0.6,
  }))

  return [...staticRoutes, ...productRoutes, ...comboRoutes]
}
