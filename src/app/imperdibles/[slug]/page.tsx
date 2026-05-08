import { notFound }      from 'next/navigation'
import Link              from 'next/link'
import Image             from 'next/image'
import {
  collection, query, where,
  getDocs, limit,
} from 'firebase/firestore'
import { db }            from '@/lib/firebase'
import { formatPrice }   from '@/lib/utils'
import AddComboToCartButton from '@/components/product/AddComboToCartButton'
import type { Combo }    from '@/types'

interface Props {
  params: Promise<{ slug: string }>
}

async function getComboBySlug(slug: string): Promise<Combo | null> {
  const snap = await getDocs(
    query(
      collection(db, 'combos'),
      where('slug',   '==', slug),
      where('active', '==', true),
      limit(1)
    )
  )
  if (snap.empty) return null
  const d = snap.docs[0]
  return { ...d.data(), id: d.id } as Combo
}

export default async function ComboPage({ params }: Props) {
  const { slug } = await params
  const combo    = await getComboBySlug(slug).catch(() => null)

  if (!combo) notFound()

  const savingsPct = Math.round((combo.savings / combo.fullPrice) * 100)

  return (
    <div className="min-h-screen bg-ivory">

      {/* Breadcrumb */}
      <div className="max-w-screen-xl mx-auto px-8 md:px-20 pt-8">
        <nav className="flex items-center gap-2 text-[11px] tracking-[0.1em] uppercase font-light text-gray-400">
          <Link href="/" className="hover:text-green-deep transition-colors">Inicio</Link>
          <span>·</span>
          <Link href="/combos" className="hover:text-green-deep transition-colors">Combos</Link>
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
        <Link href="/combos" className="btn-secondary">
          ← Ver todos los combos
        </Link>
      </div>
    </div>
  )
}