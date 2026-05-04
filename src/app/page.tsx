import Image          from 'next/image'
import Link            from 'next/link'
import { getProducts } from '@/lib/firestore'
import ProductCard     from '@/components/product/ProductCard'
import CalixtIcon      from '@/components/ui/CalixtIcon'
import type { ProductCategory } from '@/types'

const CATEGORY_CONFIG: {
  slug:     ProductCategory
  label:    string
  sublabel: string
  bg:       string
  image: string
}[] = [
  { slug: 'aceites',    label: 'Aceites de Oliva',   sublabel: 'Virgen extra · Primera prensada', bg: 'from-green-mid to-green-olive', image: '/imagenes/aceite.png' },
  { slug: 'varietales', label: 'Varietales',          sublabel: 'Monovarietales seleccionados',    bg: 'from-[#1a4a28] to-[#3d6b35]' , image: '/imagenes/aceite.png' },
  { slug: 'acetos',     label: 'Acetos',              sublabel: 'Añejados artesanalmente',         bg: 'from-[#5a1a0a] to-[#8f2412]' , image: '/imagenes/aceite.png'  },
  { slug: 'aceitunas',  label: 'Aceitunas',           sublabel: 'Marinadas y al natural',          bg: 'from-green-deep to-green-mid' , image: '/imagenes/aceituna.png'  },
  { slug: 'especiales', label: 'Especiales Gourmet',  sublabel: 'Con base de aceite de oliva',     bg: 'from-[#4a2800] to-[#8b5e3c]' , image: '/imagenes/especiales.png'  },
]

const STRIP_ITEMS = [
  'Origen Cuyo',
  'Productores reales',
  'Sin intermediarios',
  'Selección con criterio',
  'San Juan · Argentina',
  'Calidad sin compromisos',
]

export default async function HomePage() {
  // Traemos todos los productos y los destacados en paralelo
  const [allProducts, featured] = await Promise.all([
    getProducts().catch(() => []),
    getProducts({ featured: true, limitN: 8 }).catch(() => []),
  ])

  // Contamos los productos por categoría desde los datos reales
  const countByCategory = allProducts.reduce<Record<string, number>>(
    (acc, product) => {
      acc[product.category] = (acc[product.category] ?? 0) + 1
      return acc
    },
    {}
  )

  return (
    <>
      {/* ── HERO ──────────────────────────────────────────────────────── */}
      <section
        className="relative min-h-[88vh] grid grid-cols-1 md:grid-cols-2 overflow-hidden"
        style={{ backgroundColor: '#18532c' }}
      >
        <Image
          src="/imagenes/portada.png"
          alt=""
          fill
          className="object-cover object-center"
          priority
        />
       <div
          className="absolute inset-0 pointer-events-none"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
        />
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse at 70% 50%, rgba(237,131,43,0.08) 0%, transparent 60%)' }}
        />

        <div className="relative z-10 flex flex-col justify-center
                        px-10 md:px-20 py-20 animate-fade-up">
          <p
            className="text-[11px] tracking-[0.28em] uppercase font-light mb-6"
            style={{ color: '#ed832b' }}
          >
            Cuyo · San Juan · Argentina
          </p>
          <h1
            className="font-serif font-light leading-[1.05] mb-6"
            style={{ color: '#fff0dc', fontSize: 'clamp(3rem, 6vw, 5rem)' }}
          >
            Productos<br />
            regionales<br />
            con <em className='not-italic text-gold-light' >identidad</em>
          </h1>
          <p
            className="font-light text-base leading-relaxed max-w-md mb-10"
            style={{ color: 'rgba(255,240,220,0.65)' }}
          >
            Seleccionamos productos de pequeños y medianos productores de Cuyo.
            Cada uno tiene una historia, un origen y un sabor que vale la pena conocer.
          </p>
          <div className="flex gap-4 flex-wrap">
            <Link
              href="/productos"
              className="px-9 py-3.5 text-xs tracking-widest uppercase font-medium
                         transition-all duration-300 hover:-translate-y-0.5"
              style={{ backgroundColor: '#fff0dc', color: '#18532c' }}
            >
              Ver productos
            </Link>
            <Link
              href="/nosotros"
              className="px-9 py-3.5 text-xs tracking-widest uppercase font-light
                         border transition-all duration-300"
              style={{
                color:       'rgba(255,240,220,0.75)',
                borderColor: 'rgba(255,240,220,0.25)',
              }}
            >
              Quiénes somos
            </Link>
          </div>
        </div>

        <div className="hidden md:flex items-center justify-center p-12 relative z-10">
          <CalixtIcon
            color="#fff0dc"
            size={280}
            className="animate-float opacity-90"
          />
        </div>
      </section>

      {/* ── STRIP ─────────────────────────────────────────────────────── */}
      <div
        className="flex items-center justify-center gap-8 overflow-hidden
                   text-[11px] tracking-[0.22em] uppercase font-medium py-3.5"
        style={{ backgroundColor: '#ed832b', color: '#18532c' }}
      >
        {STRIP_ITEMS.map((item, i) => (
          <span key={i} className="whitespace-nowrap">{item}</span>
        ))}
      </div>

      {/* ── CATEGORÍAS ────────────────────────────────────────────────── */}
      <section className="px-8 md:px-20 py-20 bg-ivory">
        <div className="flex items-end justify-between mb-12">
          <div>
            <p className="section-label">Nuestra selección</p>
            <h2 className="section-title">
              Productos con<br />
              <em className="not-italic text-gold-light">origen y criterio</em>
            </h2>
          </div>
          <Link href="/productos" className="btn-ghost hidden md:inline-block">
            Ver todo →
          </Link>
        </div>
        {/* ── Cuadros de categorias ──────────────────────────────────────── */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-5">
          {CATEGORY_CONFIG.map(cat => {
            const count = countByCategory[cat.slug] ?? 0

            return (
              <Link
                key={cat.slug}
                href={`/productos?categoria=${cat.slug}`}
                className="group relative aspect-[3/4] overflow-hidden"
              >
                {/* Imagen de fondo */}
                <Image
                  src={cat.image}
                  alt={cat.label}
                  fill
                  className="object-cover object-center transition-transform duration-500 group-hover:scale-105"
                />

                {/* Overlay oscuro */}
                <div className="absolute inset-0 bg-black/40" />

                {/* Gradiente encima */}
                <div
                  className="absolute inset-0"
                  style={{
                    background:
                      'linear-gradient(to top, rgba(26,46,26,0.85) 0%, transparent 60%)',
                  }}
                />

                {/* Contenido */}
                <div className="absolute bottom-0 left-0 right-0 p-5 z-10">
                  <p className="font-serif text-[1.2rem]" style={{ color: '#fff0dc' }}>
                    {cat.label}
                  </p>
                  <p
                    className="text-[10px] tracking-wider uppercase mt-1 font-light"
                    style={{ color: 'rgba(255,240,220,0.65)' }}
                  >
                    {count === 0
                      ? 'Próximamente'
                      : `${count} ${count === 1 ? 'producto' : 'productos'}`}
                  </p>
                </div>
              </Link>
            )
          })}
        </div>


      </section>

      {/* ── PRODUCTOS DESTACADOS ──────────────────────────────────────── */}
      <section className="px-8 md:px-20 py-20" style={{ backgroundColor: '#fff0dc' }}>
        <div className="flex items-end justify-between mb-12">
          <div>
            <p className="section-label">Productos destacados</p>
            <h2 className="section-title">
              Los más<br />
              <em className="not-italic text-gold-light">elegidos</em>
            </h2>
          </div>
          <Link href="/productos" className="btn-ghost hidden md:inline-block">
            Ver todos →
          </Link>
        </div>

        {featured.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-7">
            {featured.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <p className="text-center text-green-olive font-light py-12">
            Cargando productos…
          </p>
        )}
      </section>

      {/* ── BANNER MARCA ──────────────────────────────────────────────── */}
      <section
        className="px-8 md:px-20 py-24 grid grid-cols-1 md:grid-cols-2
                   gap-16 items-center relative overflow-hidden"
        style={{ backgroundColor: '#18532c' }}
      >
        <div className="absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none select-none">
          <span
            className="font-serif font-bold leading-none"
            style={{ fontSize: '12rem', color: 'rgba(255,255,255,0.03)' }}
          >
            Cuyo
          </span>
        </div>

        <div className="relative z-10">
          <p
            className="text-[11px] tracking-[0.28em] uppercase font-light mb-4"
            style={{ color: '#ed832b' }}
          >
            Por qué Calixto
          </p>
          <h2
            className="font-serif font-light leading-tight mb-6"
            style={{ color: '#fff0dc', fontSize: 'clamp(2rem, 3.5vw, 3rem)' }}
          >
            Una selección<br />
            con criterio.<br />
            <em className="not-italic text-gold-light" >
              No con volumen.
            </em>
          </h2>
          <p
            className="font-light leading-[1.85] text-sm mb-9 max-w-lg"
            style={{ color: 'rgba(255,240,220,0.6)' }}
          >
            Cada producto que ofrecemos pasó por una decisión consciente.
            Trabajamos con pequeños y medianos productores de Cuyo que priorizan
            la calidad y el origen por sobre la producción masiva.
            Eso es lo que nos hace diferentes.
          </p>
          <Link
            href="/nosotros"
            className="inline-block px-9 py-3.5 text-xs tracking-widest uppercase font-medium
                       transition-all duration-300 hover:-translate-y-0.5"
            style={{ backgroundColor: '#fff0dc', color: '#18532c' }}
          >
            Conocer más
          </Link>

          <div
            className="flex gap-12 mt-10 pt-10"
            style={{ borderTop: '1px solid rgba(255,240,220,0.1)' }}
          >
            {[
              { num: 'Cuyo',  lbl: 'Nuestra región'    },
              { num: '100%',  lbl: 'Sin intermediarios'},
            ].map(({ num, lbl }) => (
              <div key={lbl}>
                <p
                  className="font-serif text-[2rem] font-normal leading-none"
                  style={{ color: '#fff0dc' }}
                >
                  {num}
                </p>
                <p
                  className="text-[10px] tracking-[0.15em] uppercase mt-1.5 font-light"
                  style={{ color: 'rgba(255,240,220,0.4)' }}
                >
                  {lbl}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="hidden md:flex items-center justify-center relative z-10">
          <CalixtIcon color="rgba(255,240,220,0.12)" size={320} />
        </div>
      </section>
    </>
  )
}