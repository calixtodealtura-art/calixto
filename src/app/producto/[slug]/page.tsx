import { notFound }          from 'next/navigation'
import { Metadata }          from 'next'
import { getProductBySlug }   from '@/lib/firestore'
import AddToCartButton        from '@/components/product/AddToCartButton'
import ProductGallery         from '@/components/product/ProductGallery'
import { formatPrice }        from '@/lib/utils'

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const product = await getProductBySlug(slug).catch(() => null)

  if (!product) {
    return {
      title: 'Producto no encontrado',
    }
  }

  // Si tu `product.images[0]` guarda una ruta relativa, conviértela en absoluta.
  // Reemplazá 'https://tudominio.com' por tu dominio real.
  const rawImage = product.images?.[0]
  const imageUrl = rawImage
    ? (rawImage.startsWith('http') ? rawImage : `https://calixto.ar${rawImage}`)
    : 'https://calixto.ar/og-default.png'

  const description = product.description
    ? product.description.slice(0, 160)
    : `${product.name} - Descubrí este producto en nuestra tienda.`

  return {
    title: product.name,
    description,
    openGraph: {
      title: product.name,
      description,
      url: `https://calixto.ar/productos/${slug}`, // ajustá la ruta según tu estructura
      siteName: 'Calixto Sabores de Altura', // reemplazá con el nombre real de tu sitio
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: product.name,
        },
      ],
      type: 'website',
      locale: 'es_AR', // o 'es_ES' / 'es_MX' según tu público
    },
    twitter: {
      card: 'summary_large_image',
      title: product.name,
      description,
      images: [imageUrl],
    },
  }
}

export default async function ProductPage({ params }: Props) {
  const { slug }  = await params
  const product   = await getProductBySlug(slug).catch(() => null)

  if (!product) notFound()

  return (
    <div className="min-h-screen bg-ivory">
      <div className="max-w-screen-xl mx-auto px-8 md:px-20 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-start">

          {/* Images */}
          <ProductGallery images={product.images ?? []} productName={product.name} />

          {/* Info */}
          <div className="pt-4">
            <p className="section-label">{product.category}</p>
            <h1 className="font-serif text-4xl md:text-5xl font-light text-green-deep leading-tight mb-2">
              {product.name}
            </h1>

            {product.badge && (
              <span className="inline-block text-[10px] tracking-wider uppercase px-3 py-1
                               bg-green-deep text-gold-light font-medium mb-5">
                {product.badge}
              </span>
            )}

            {/* Price */}
            <div className="flex items-baseline gap-3 mb-8">
              <span className="font-serif text-3xl font-semibold text-green-deep">
                {formatPrice(product.price)}
              </span>
              {product.oldPrice && (
                <span className="text-lg text-gray-400 line-through font-light">
                  {formatPrice(product.oldPrice)}
                </span>
              )}
            </div>

            <p className="text-gray-600 font-light leading-[1.8] text-sm mb-8 max-w-md">
              {product.description}
            </p>

            {/* Specs */}
            {(product.volume || product.origin || product.acidity) && (
              <div className="flex flex-wrap gap-5 mb-8 py-6 border-y border-cream-warm">
                {product.volume && (
                  <div>
                    <p className="text-[9px] tracking-[0.2em] uppercase text-green-olive font-light">Contenido</p>
                    <p className="font-serif text-base text-green-deep mt-0.5">{product.volume}</p>
                  </div>
                )}
                {product.origin && (
                  <div>
                    <p className="text-[9px] tracking-[0.2em] uppercase text-green-olive font-light">Origen</p>
                    <p className="font-serif text-base text-green-deep mt-0.5">{product.origin}</p>
                  </div>
                )}
                {product.acidity && (
                  <div>
                    <p className="text-[9px] tracking-[0.2em] uppercase text-green-olive font-light">Acidez</p>
                    <p className="font-serif text-base text-green-deep mt-0.5">{product.acidity}</p>
                  </div>
                )}
              </div>
            )}

            {/* Stock status */}
            <p className={`text-[11px] tracking-widest uppercase font-medium mb-5
                           ${product.stock > 0 ? 'text-green-olive' : 'text-terra'}`}>
              {product.stock > 0
                ? `● En stock (${product.stock} unidades)`
                : '● Sin stock'}
            </p>

            <AddToCartButton product={product} />
          </div>
        </div>
      </div>
    </div>
  )
}