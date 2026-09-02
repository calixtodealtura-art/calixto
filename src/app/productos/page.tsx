import type { Metadata } from 'next'
import { getProducts } from '@/lib/firestore'
import { CATEGORY_LABELS, type ProductCategory } from '@/types'
import ProductosClient from './ProductosClient'

interface Props {
  searchParams: Promise<{ categoria?: string }>
}

function isValidCategory(value: string | undefined): value is ProductCategory {
  return !!value && value in CATEGORY_LABELS
}

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const { categoria } = await searchParams
  const category = isValidCategory(categoria) ? categoria : null

  const title = category
    ? `${CATEGORY_LABELS[category]} | Calixto`
    : 'Catálogo completo | Calixto — Sabores de Altura'

  const description = category
    ? `Descubrí nuestra selección de ${CATEGORY_LABELS[category].toLowerCase()} artesanales de la región de Cuyo, Argentina.`
    : 'Explorá el catálogo completo de aceites de oliva, varietales, acetos, aceitunas y productos gourmet de Calixto.'

  return {
    title,
    description,
    alternates: {
      canonical: category ? `/productos?categoria=${category}` : '/productos',
    },
  }
}

export default async function ProductosPage({ searchParams }: Props) {
  const { categoria } = await searchParams
  const category = isValidCategory(categoria) ? categoria : null

  const products = await getProducts({ category: category ?? undefined }).catch(() => [])

  return <ProductosClient products={products} category={category} />
}
