import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Política de privacidad | Calixto — Sabores de Altura',
  description: 'Cómo Calixto recopila, usa y protege tus datos personales, y qué cookies usa el sitio.',
  alternates: { canonical: '/privacidad' },
}

const LAST_UPDATED = '18 de noviembre de 2026'

const SECTIONS = [
  { id: 'responsable', title: 'Responsable' },
  { id: 'datos',       title: 'Qué datos recopilamos' },
  { id: 'finalidad',   title: 'Para qué los usamos' },
  { id: 'terceros',    title: 'Con quién los compartimos' },
  { id: 'cookies',     title: 'Cookies' },
  { id: 'conservacion', title: 'Cuánto tiempo los guardamos' },
  { id: 'derechos',    title: 'Tus derechos' },
  { id: 'cambios',     title: 'Cambios en esta política' },
]

function Section({ id, title, children }: { id: string; title: string; children: React.ReactNode }) {
  return (
    <section id={id} className="scroll-mt-32 mb-14">
      <h2 className="font-serif text-2xl font-normal text-green-deep mb-5">{title}</h2>
      <div className="space-y-4 text-gray-600 font-light leading-[1.85] text-sm">{children}</div>
    </section>
  )
}

export default function PrivacidadPage() {
  return (
    <div className="bg-ivory">
      <section style={{ backgroundColor: '#18532c' }}>
        <div className="max-w-screen-xl mx-auto px-8 md:px-20 pt-36 pb-16">
          <p className="text-[11px] tracking-[0.28em] uppercase text-orange font-light mb-5">
            Legal
          </p>
          <h1
            className="font-serif font-light text-cream leading-[1.05] mb-6"
            style={{ fontSize: 'clamp(2.4rem, 5vw, 4rem)' }}
          >
            Política de privacidad
          </h1>
          <p className="text-cream/60 font-light text-sm">
            Última actualización: {LAST_UPDATED}
          </p>
        </div>
      </section>

      <div className="max-w-screen-xl mx-auto px-8 md:px-20 py-20
                      grid grid-cols-1 md:grid-cols-[220px_1fr] gap-12 md:gap-20">
        <nav aria-label="Secciones" className="hidden md:block">
          <ul className="sticky top-32 space-y-3 border-l border-green-deep/15 pl-5">
            {SECTIONS.map(s => (
              <li key={s.id}>
                <a href={`#${s.id}`} className="text-[13px] text-gray-500 font-light hover:text-green-deep transition-colors">
                  {s.title}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <article className="max-w-2xl">
          <p className="text-gray-600 font-light leading-[1.85] text-sm mb-14">
            En Calixto cuidamos los datos que nos confiás al navegar, crear una cuenta, comprar o
            escribirnos. Esta política explica qué información recopilamos, para qué la usamos y
            cómo podés ejercer tus derechos, de acuerdo con la Ley 25.326 de Protección de los
            Datos Personales de la República Argentina.
          </p>

          <Section id="responsable" title="Responsable">
            <p>
              El responsable del tratamiento de tus datos es Calixto — Sabores de Altura, con
              domicilio en Pilar, Provincia de Buenos Aires, Argentina. Para cualquier consulta sobre
              privacidad podés escribirnos desde la página de{' '}
              <Link href="/contacto" className="text-green-olive underline underline-offset-2">contacto</Link>.
            </p>
          </Section>

          <Section id="datos" title="Qué datos recopilamos">
            <ul className="list-disc pl-5 space-y-2">
              <li>
                <strong className="font-medium text-gray-700">Cuenta:</strong> nombre, email y foto
                de perfil cuando te registrás con email o con tu cuenta de Google.
              </li>
              <li>
                <strong className="font-medium text-gray-700">Pedidos:</strong> nombre completo,
                teléfono y, si elegís envío, dirección, ciudad, provincia y código postal, junto con
                el detalle de los productos comprados.
              </li>
              <li>
                <strong className="font-medium text-gray-700">Contacto:</strong> nombre, email,
                asunto y mensaje que nos envías desde el formulario.
              </li>
              <li>
                <strong className="font-medium text-gray-700">Navegación:</strong> si aceptás las
                cookies analíticas, datos de uso como páginas visitadas, dispositivo y ubicación
                aproximada, de forma agregada.
              </li>
            </ul>
            <p>
              <strong className="font-medium text-gray-700">No guardamos datos de tarjetas.</strong>{' '}
              Los pagos se procesan íntegramente en Mercado Pago.
            </p>
          </Section>

          <Section id="finalidad" title="Para qué los usamos">
            <ul className="list-disc pl-5 space-y-2">
              <li>Procesar, preparar y enviar tus pedidos, y avisarte sobre su estado.</li>
              <li>Gestionar tu cuenta y mostrarte tu historial de compras.</li>
              <li>Responder tus consultas.</li>
              <li>Entender cómo se usa el sitio para mejorarlo, solo si aceptaste las cookies analíticas.</li>
            </ul>
            <p>No vendemos ni alquilamos tus datos personales.</p>
          </Section>

          <Section id="terceros" title="Con quién los compartimos">
            <p>Trabajamos con proveedores que tratan datos por nuestra cuenta, solo para prestar el servicio:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li><strong className="font-medium text-gray-700">Google Firebase:</strong> autenticación y base de datos de cuentas y pedidos.</li>
              <li><strong className="font-medium text-gray-700">Mercado Pago:</strong> procesamiento de pagos.</li>
              <li><strong className="font-medium text-gray-700">Vercel:</strong> alojamiento del sitio.</li>
              <li><strong className="font-medium text-gray-700">Google Analytics:</strong> estadísticas de uso, solo con tu consentimiento.</li>
              <li><strong className="font-medium text-gray-700">Empresas de logística:</strong> nombre, teléfono y dirección necesarios para entregar tu pedido.</li>
            </ul>
            <p>
              Algunos de estos proveedores pueden almacenar datos en servidores fuera de Argentina,
              con niveles de protección adecuados. También podemos compartir datos si lo exige una
              autoridad competente.
            </p>
          </Section>

          <Section id="cookies" title="Cookies">
            <p>
              Las cookies y tecnologías similares son pequeños archivos que se guardan en tu navegador.
              Usamos dos tipos:
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li>
                <strong className="font-medium text-gray-700">Esenciales:</strong> mantienen tu
                sesión iniciada, recuerdan tu carrito y guardan tu preferencia de cookies. Sin ellas
                la tienda no funciona, por eso no se pueden desactivar.
              </li>
              <li>
                <strong className="font-medium text-gray-700">Analíticas (Google Analytics):</strong>{' '}
                nos ayudan a saber qué páginas se visitan y cómo se navega el sitio. Solo se activan
                si las aceptás.
              </li>
            </ul>
            <p>
              Podés cambiar tu elección en cualquier momento con el enlace «Configurar cookies» al
              pie de cada página, o borrar las cookies desde la configuración de tu navegador.
            </p>
          </Section>

          <Section id="conservacion" title="Cuánto tiempo los guardamos">
            <p>
              Conservamos los datos de tu cuenta mientras la tengas activa, y los de pedidos durante
              el plazo que exigen las normas fiscales y comerciales. Los mensajes de contacto se
              guardan mientras sean necesarios para responder tu consulta.
            </p>
          </Section>

          <Section id="derechos" title="Tus derechos">
            <p>
              Podés solicitar el acceso, la rectificación, la actualización o la supresión de tus
              datos personales escribiéndonos desde la página de{' '}
              <Link href="/contacto" className="text-green-olive underline underline-offset-2">contacto</Link>.
              Responderemos dentro de los plazos legales.
            </p>
            <p className="text-[13px] border-l-2 border-orange/60 pl-4 text-gray-500">
              El titular de los datos personales tiene la facultad de ejercer el derecho de acceso a
              los mismos en forma gratuita a intervalos no inferiores a seis meses, salvo que se
              acredite un interés legítimo al efecto conforme lo establecido en el artículo 14,
              inciso 3 de la Ley N° 25.326. La AGENCIA DE ACCESO A LA INFORMACIÓN PÚBLICA, en su
              carácter de Órgano de Control de la Ley N° 25.326, tiene la atribución de atender las
              denuncias y reclamos que interpongan quienes resulten afectados en sus derechos por
              incumplimiento de las normas vigentes en materia de protección de datos personales.
            </p>
          </Section>

          <Section id="cambios" title="Cambios en esta política">
            <p>
              Podemos actualizar esta política para reflejar cambios en el sitio o en la normativa.
              Publicaremos la versión vigente en esta página con su fecha de actualización.
            </p>
          </Section>
        </article>
      </div>
    </div>
  )
}
