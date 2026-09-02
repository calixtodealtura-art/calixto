import { notFound }      from 'next/navigation'
import type { Metadata } from 'next'
import Link              from 'next/link'
import Image             from 'next/image'
import { getComboBySlug } from '@/lib/firestore'
import { formatPrice }   from '@/lib/utils'
import AddComboToCartButton from '@/components/product/AddComboToCartButton'
import JsonLd             from '@/components/seo/JsonLd'

export const revalidate = 60

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const combo = await getComboBySlug(slug).catch(() => null)

  if (!combo) {
    return { title: 'Combo no encontrado' }
  }

  const description = combo.description
    ? combo.description.slice(0, 160)
    : `${combo.name} - Combo especial con descuento en Calixto.`

  const imageUrl = combo.images?.[0] ?? 'https://calixto.ar/og-default.png'

  return {
    title: combo.name,
    description,
    alternates: {
      canonical: `/imperdibles/${slug}`,
    },
    openGraph: {
      title:    combo.name,
      description,
      url:      `https://calixto.ar/imperdibles/${slug}`,
      siteName: 'Calixto — Sabores de Altura',
      images: [
        {
          url:    imageUrl,
          width:  1200,
          height: 630,
          alt:    combo.name,
        },
      ],
      type:   'website',
      locale: 'es_AR',
    },
    twitter: {
      card:        'summary_large_image',
      title:       combo.name,
      description,
      images:      [imageUrl],
    },
  }
}

export default async function ComboPage({ params }: Props) {
  const { slug } = await params
  const combo    = await getComboBySlug(slug).catch(() => null)

  if (!combo) notFound()

  const savingsPct = Math.round((combo.savings / combo.fullPrice) * 100)

  const comboJsonLd = {
    '@context':  'https://schema.org',
    '@type':     'Product',
    name:        combo.name,
    description: combo.description,
    image:       combo.images ?? [],
    sku:         combo.id,
    offers: {
      '@type':      'Offer',
      url:           `https://calixto.ar/imperdibles/${slug}`,
      priceCurrency: 'ARS',
      price:         combo.comboPrice,
      availability:  'https://schema.org/InStock',
    },
  }

  return (
    <div className="min-h-screen bg-ivory">
      <JsonLd data={comboJsonLd} />

      {/* Breadcrumb */}
      <div className="max-w-screen-xl mx-auto px-8 md:px-20 pt-8">
        <nav className="flex items-center gap-2 text-[11px] tracking-[0.1em] uppercase font-light text-gray-400">
          <Link href="/" className="hover:text-green-deep transition-colors">Inicio</Link>
          <span>·</span>
          <Link href="/imperdibles" className="hover:text-green-deep transition-colors">Combos</Link>
          <span>·</span>
          <span className="text-green-deep">{combo.name}</span>
        </nav>
      </div>

      {/* Contenido principal */}
      <div className="max-w-screen-xl mx-auto px-8 md:px-20 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-start">

          {/* Imagen */}
          <div className="relative aspect-[4/5] overflow-hidden"
               style={{ backgroundColor: '#fff0dc' }}>
            {combo.images?.[0] ? (
              <Image
                src={combo.images[0]}
                alt={combo.name}
                fill
                sizes="(min-width: 768px) 50vw, 100vw"
                className="object-cover"
                priority
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center gap-4 p-8">
                {/* Muestra los primeros 3 emojis de productos */}
                <div className="text-7xl">🎁</div>
                <div className="flex gap-2 flex-wrap justify-center">
                  {combo.items.slice(0, 4).map(item => (
                    <span
                      key={item.productId}
                      className="text-[11px] tracking-wide uppercase px-3 py-1.5 font-light"
                      style={{ backgroundColor: '#18532c', color: '#fff0dc' }}
                    >
                      {item.quantity}x {item.productName}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Badge ahorro */}
            <div
              className="absolute top-4 right-4 flex flex-col items-center
                         justify-center w-20 h-20 rounded-full"
              style={{ backgroundColor: '#ed832b' }}
            >
              <span className="font-serif text-xl font-bold text-white leading-none">
                {savingsPct}%
              </span>
              <span className="text-[9px] uppercase tracking-wider text-white font-medium">
                off
              </span>
            </div>
          </div>

          {/* Info */}
          <div className="pt-4">
            <p className="section-label">Combo especial</p>

            <h1 className="font-serif text-4xl md:text-5xl font-light text-green-deep
                           leading-tight mb-3">
              {combo.name}
            </h1>

            {combo.badge && (
              <span
                className="inline-block text-[10px] tracking-wider uppercase px-3 py-1
                           font-medium mb-5"
                style={{ backgroundColor: '#18532c', color: '#fff0dc' }}
              >
                {combo.badge}
              </span>
            )}

            {combo.description && (
              <p className="text-gray-600 font-light leading-[1.8] text-sm mb-8 max-w-md">
                {combo.description}
              </p>
            )}

            {/* Precio */}
            <div
              className="p-6 mb-8"
              style={{ backgroundColor: '#fff0dc' }}
            >
              <div className="flex items-baseline gap-4 mb-3">
                <span className="font-serif text-4xl font-semibold text-green-deep">
                  {formatPrice(combo.comboPrice)}
                </span>
                <span className="font-serif text-xl text-gray-400 line-through font-light">
                  {formatPrice(combo.fullPrice)}
                </span>
              </div>
              <div
                className="flex items-center gap-2 text-sm font-medium"
                style={{ color: '#ed832b' }}
              >
                <span>✦</span>
                <span>
                  Ahorrás {formatPrice(combo.savings)} ({savingsPct}% de descuento)
                </span>
              </div>
            </div>

            {/* Productos incluidos */}
            <div className="mb-8">
              <p className="text-[10px] tracking-[0.2em] uppercase text-green-olive
                             font-medium mb-4">
                Este combo incluye
              </p>
              <div className="space-y-3">
                {combo.items.map(item => (
                  <div
                    key={item.productId}
                    className="flex items-center justify-between py-3
                               border-b border-cream-warm last:border-0"
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className="w-7 h-7 flex items-center justify-center
                                   font-serif text-sm font-semibold shrink-0"
                        style={{ backgroundColor: '#18532c', color: '#fff0dc' }}
                      >
                        {item.quantity}
                      </span>
                      <div>
                        <p className="text-sm text-green-deep font-light">
                          {item.productName}
                        </p>
                        <p className="text-[11px] text-gray-400 font-light">
                          {formatPrice(item.unitPrice)} c/u
                        </p>
                      </div>
                    </div>
                    <span className="font-serif text-sm font-semibold text-green-deep">
                      {formatPrice(item.unitPrice * item.quantity)}
                    </span>
                  </div>
                ))}

                {/* Total sin combo */}
                <div className="flex justify-between pt-2">
                  <span className="text-[11px] tracking-wide uppercase text-gray-400 font-light">
                    Total sin descuento
                  </span>
                  <span className="font-serif text-base text-gray-400 line-through font-light">
                    {formatPrice(combo.fullPrice)}
                  </span>
                </div>
              </div>
            </div>

            <AddComboToCartButton combo={combo} />

            <p className="text-[11px] text-gray-400 font-light mt-4 tracking-wide">
              Envío a todo el país · Calculá el costo en el carrito
            </p>
          </div>
        </div>
      </div>

      {/* CTA volver */}
      <div className="text-center py-16 border-t border-cream-warm mt-8">
        <Link href="/imperdibles" className="btn-secondary">
          ← Ver todos los combos
        </Link>
      </div>
    </div>
  )
}