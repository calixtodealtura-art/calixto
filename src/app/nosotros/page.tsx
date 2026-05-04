import LogoPrincipal from '@/components/ui/LogoPrincipal'
import Image          from 'next/image'

export default function NosotrosPage() {
  return (
    <div className="bg-ivory">

      {/* ── HERO ─────────────────────────────────────────────────────── */}
      <section
        className="relative min-h-[70vh] flex items-end"
        style={{ backgroundColor: '#18532c' }}
      >
        <Image
                  src="/imagenes/portada2.png"
                  alt=""
                  fill
                  className="object-cover object-center"
                  priority
                />
        {/* Texto decorativo de fondo */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
        />
        <div
          className="absolute inset-0 flex items-center justify-center
                     pointer-events-none select-none overflow-hidden"
        >
          <span
            className="font-serif font-bold text-white/[0.04] leading-none"
            style={{ fontSize: 'clamp(8rem, 20vw, 18rem)' }}
          >
            Calixto
          </span>
        </div>

        <div className="relative z-10 max-w-screen-xl mx-auto px-8 md:px-20 pb-20 pt-32">
          <p className="text-[11px] tracking-[0.28em] uppercase text-orange font-light mb-5">
            Quiénes somos
          </p>
          <h1
            className="font-serif font-light text-cream leading-[1.05] mb-8"
            style={{ fontSize: 'clamp(3rem, 6vw, 5rem)' }}
          >
            Una selección<br />
            con <em className='not-italic text-gold-light' >criterio</em>
          </h1>
          <p className="text-cream/60 font-light text-base leading-relaxed max-w-xl">
            Calixto nace inspirado en la cordillera y en la identidad de la región de Cuyo.
            Seleccionamos y acercamos productos regionales, poniendo en valor su origen,
            su calidad y la historia que hay detrás de cada uno.
          </p>
        </div>
      </section>

      {/* ── PROPÓSITO ────────────────────────────────────────────────── */}
      <section className="max-w-screen-xl mx-auto px-8 md:px-20 py-24
                          grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
        <div>
          <p className="section-label">Nuestro propósito</p>
          <h2 className="section-title mb-8">
            Del productor<br />
            <em className='not-italic text-gold-light' >a tu mesa</em>
          </h2>
          <p className="text-gray-600 font-light leading-[1.85] text-sm mb-6">
            Poner en valor los productos regionales y a quienes los producen, generando un vínculo
            directo entre el origen y el consumidor. Calixto busca que cada producto no solo sea
            consumido, sino también apreciado por su historia, su calidad y su identidad.
          </p>
          <p className="text-gray-600 font-light leading-[1.85] text-sm">
            Detrás de cada producto hay una decisión: priorizar origen, trabajo real y calidad
            por sobre volumen. Mientras otros estandarizan, Calixto elige lo que conserva
            carácter, lo que tiene identidad y no se diluye en lo masivo.
          </p>
        </div>

        {/* Panel verde con logo */}
        <div
            className="relative flex items-center justify-center aspect-square max-w-sm mx-auto w-full overflow-hidden"
          >
            <Image
              src="/imagenes/portada.png"
              alt=""
              fill
              className="object-cover object-center"
              priority
            />

            <LogoPrincipal color="#fff0dc" size={220} className="relative z-10" />
          </div>
      </section>

      {/* ── MISIÓN Y VISIÓN ──────────────────────────────────────────── */}
      <section style={{ backgroundColor: '#fff0dc' }} id="origen">
        <div className="max-w-screen-xl mx-auto px-8 md:px-20 py-24
                        grid grid-cols-1 md:grid-cols-2 gap-0">

          {/* Misión */}
          <div className="md:border-r border-cream-warm px-0 md:pr-20 pb-16 md:pb-0">
            <div
              className="inline-block text-[10px] tracking-[0.25em] uppercase font-medium
                         px-4 py-1.5 mb-8"
              style={{ backgroundColor: '#18532c', color: '#fff0dc' }}
            >
              Misión
            </div>
            <h2 className="font-serif text-3xl font-light text-green-deep mb-6 leading-tight">
              Un puente entre<br />el origen y el<br />
              <em className='not-italic text-gold-light'>consumidor</em>
            </h2>
            <p className="text-gray-600 font-light leading-[1.85] text-sm">
              Seleccionar y comercializar productos de pequeños y medianos productores de la región
              de Cuyo, asegurando calidad, eficiencia y coherencia en cada etapa del proceso.
              Calixto actúa como un puente entre el origen y el consumidor, facilitando el acceso
              a productos auténticos sin perder su identidad.
            </p>
          </div>

          {/* Visión */}
          <div className="md:pl-20 pt-16 md:pt-0">
            <div
              className="inline-block text-[10px] tracking-[0.25em] uppercase font-medium
                         px-4 py-1.5 mb-8"
              style={{ backgroundColor: '#8f2412', color: '#fff0dc' }}
            >
              Visión
            </div>
            <h2 className="font-serif text-3xl font-light text-green-deep mb-6 leading-tight">
              Referentes en<br />productos regionales<br />
              <em className='not-italic text-gold-light'>a nivel nacional</em>
            </h2>
            <p className="text-gray-600 font-light leading-[1.85] text-sm">
              Ser una marca referente en productos regionales a nivel nacional, reconocida por
              su capacidad de conectar la identidad de Cuyo con consumidores que valoran la calidad
              y el origen. Calixto busca consolidarse como un símbolo de confianza, autenticidad
              y selección cuidada.
            </p>
          </div>
        </div>
      </section>

      {/* ── VALORES ──────────────────────────────────────────────────── */}
      <section className="max-w-screen-xl mx-auto px-8 md:px-20 py-24">
        <div className="text-center mb-16">
          <p className="section-label">Lo que nos guía</p>
          <h2 className="section-title">
            Nuestros <em className='not-italic text-gold-light'>valores</em>
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
          {[
            {
              valor:  'Identidad',
              texto:  'La base de cada selección. Respetamos el origen y la esencia de los productos.',
              color:  '#18532c',
            },
            {
              valor:  'Calidad',
              texto:  'Un pilar central. Procesos cuidados y resultados consistentes en cada etapa.',
              color:  '#ed832b',
            },
            {
              valor:  'Autenticidad',
              texto:  'Define cada decisión. Priorizamos lo real por sobre lo masivo.',
              color:  '#8f2412',
            },
            {
              valor:  'Perseverancia',
              texto:  'Junto al conocimiento, impulsan el crecimiento sostenido de la marca.',
              color:  '#18532c',
            },
            {
              valor:  'Eficiencia',
              texto:  'Optimizar cada etapa para garantizar una propuesta sólida y confiable.',
              color:  '#ed832b',
            },
          ].map(({ valor, texto, color }) => (
            <div key={valor} className="group">
              <div
                className="h-1 mb-6 transition-all duration-300 group-hover:h-1.5"
                style={{ backgroundColor: color }}
              />
              <h3
                className="font-serif text-xl font-normal mb-3"
                style={{ color }}
              >
                {valor}
              </h3>
              <p className="text-sm text-gray-500 font-light leading-relaxed">
                {texto}
              </p>
            </div>
          ))}
        </div>
      </section>

    </div>
  )
}