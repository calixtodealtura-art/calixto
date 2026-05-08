import Link              from 'next/link'
import Image             from 'next/image'
import {
  collection, query, where,
  getDocs, orderBy,
} from 'firebase/firestore'
import { db }            from '@/lib/firebase'
import { formatPrice }   from '@/lib/utils'
import type { Combo }    from '@/types'

async function getCombos(): Promise<Combo[]> {
  const snap = await getDocs(
    query(
      collection(db, 'combos'),
      where('active', '==', true),
      orderBy('createdAt', 'desc')
    )
  )
  return snap.docs.map(d => ({ ...d.data(), id: d.id }) as Combo)
}

export default async function CombosPage() {
  const combos = await getCombos().catch(() => [])

  return (
    <div className="min-h-screen bg-ivory">

      {/* Hero */}
      <section
        className="px-8 md:px-20 py-20"
        style={{ backgroundColor: '#18532c' }}
      >
        <p
          className="text-[11px] tracking-[0.28em] uppercase font-light mb-4"
          style={{ color: '#ed832b' }}
        >
          Ofertas especiales
        </p>
        <h1
          className="font-serif font-light leading-tight mb-4"
          style={{ color: '#fff0dc', fontSize: 'clamp(2.5rem, 5vw, 4rem)' }}
        >
          Combos <em className="italic">gourmet</em>
        </h1>
        <p
          className="font-light text-base max-w-xl"
          style={{ color: 'rgba(255,240,220,0.65)' }}
        >
          Selecciones especiales de nuestros mejores productos a un precio único.
          Más sabor, mejor precio.
        </p>
      </section>

      {/* Grid de combos */}
      <section className="max-w-screen-xl mx-auto px-8 md:px-20 py-16">
        {combos.length === 0 ? (
          <div className="text-center py-24">
            <p className="font-serif text-2xl text-green-olive mb-3">
              Próximamente nuevos combos
            </p>
            <p className="text-sm text-gray-400 font-light mb-8">
              Estamos preparando selecciones especiales para vos.
            </p>
            <Link href="/productos" className="btn-primary">
              Ver productos individuales
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {combos.map(combo => {
              const savingsPct = Math.round((combo.savings / combo.fullPrice) * 100)
              return (
                <Link
                  key={combo.id}
                  href={`/combos/${combo.slug}`}
                  className="group bg-white border border-cream-warm
                             hover:-translate-y-2 hover:shadow-xl transition-all duration-300"
                >
                  {/* Imagen */}
                  <div
                    className="relative aspect-[4/3] overflow-hidden"
                    style={{ backgroundColor: '#fff0dc' }}
                  >
                    {combo.images?.[0] ? (
                      <Image
                        src={combo.images[0]}
                        alt={combo.name}
                        fill
                        className="object-cover transition-transform duration-500
                                   group-hover:scale-105"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-6xl">
                        🎁
                      </div>
                    )}

                    {/* Badge descuento */}
                    <div
                      className="absolute top-3 right-3 w-14 h-14 rounded-full
                                 flex flex-col items-center justify-center"
                      style={{ backgroundColor: '#ed832b' }}
                    >
                      <span className="font-serif text-base font-bold text-white leading-none">
                        {savingsPct}%
                      </span>
                      <span className="text-[8px] uppercase text-white font-medium">off</span>
                    </div>

                    {combo.badge && (
                      <span
                        className="absolute top-3 left-3 text-[10px] tracking-wider
                                   uppercase px-2.5 py-1 font-medium"
                        style={{ backgroundColor: '#18532c', color: '#fff0dc' }}
                      >
                        {combo.badge}
                      </span>
                    )}
                  </div>

                  {/* Info */}
                  <div className="p-6 border-t border-cream-warm">
                    <p className="section-label !mb-1">Combo especial</p>
                    <h2 className="font-serif text-xl font-light text-green-deep mb-2">
                      {combo.name}
                    </h2>

                    {/* Productos incluidos */}
                    <p className="text-[11px] text-gray-400 font-light mb-4 leading-relaxed">
                      {combo.items.map(i => `${i.quantity}x ${i.productName}`).join(' + ')}
                    </p>

                    {/* Precio */}
                    <div className="flex items-baseline gap-3 mb-2">
                      <span className="font-serif text-2xl font-semibold text-green-deep">
                        {formatPrice(combo.comboPrice)}
                      </span>
                      <span className="font-serif text-base text-gray-400 line-through font-light">
                        {formatPrice(combo.fullPrice)}
                      </span>
                    </div>

                    <p
                      className="text-[12px] font-medium"
                      style={{ color: '#ed832b' }}
                    >
                      Ahorrás {formatPrice(combo.savings)}
                    </p>
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </section>
    </div>
  )
}