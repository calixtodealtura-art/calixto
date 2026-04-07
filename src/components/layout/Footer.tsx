import Link          from 'next/link'
import LogoPrincipal from '@/components/ui/LogoPrincipal'

const LINKS = {
  'Productos': [
    { label: 'Aceites de Oliva', href: '/productos?categoria=aceites'    },
    { label: 'Varietales',       href: '/productos?categoria=varietales' },
    { label: 'Acetos',           href: '/productos?categoria=acetos'     },
    { label: 'Aceitunas',        href: '/productos?categoria=aceitunas'  },
    { label: 'Salsas',           href: '/productos?categoria=salsas'     },
  ],
  'Empresa': [
    { label: 'Nuestra historia', href: '/nosotros'        },
    { label: 'El origen',        href: '/nosotros#origen' },
    { label: 'Recetas',          href: '/recetas'         },
  ],
  'Ayuda': [
    { label: 'Envíos',               href: '/envios'       },
    { label: 'Devoluciones',         href: '/devoluciones' },
    { label: 'Preguntas frecuentes', href: '/faq'          },
    { label: 'Contacto',             href: '/contacto'     },
  ],
}

export default function Footer() {
  return (
    <footer style={{ backgroundColor: '#8f2412' }}>
      <div className="max-w-screen-xl mx-auto px-8 md:px-20 pt-16 pb-8">

        {/* Top grid */}
        <div className="grid grid-cols-1 md:grid-cols-[180px_1fr_1fr_1fr] gap-12 mb-14
                        pb-14 border-b border-cream/10">

          {/* Logo + tagline */}
          <div className="flex flex-col items-start gap-4">
            <LogoPrincipal color="#fff0dc" size={150} />
            <p className="text-[12px] text-cream/50 font-light leading-relaxed">
              Productos regionales de Cuyo, con identidad y criterio.
            </p>
          </div>

          {/* Nav columns */}
          {Object.entries(LINKS).map(([title, links]) => (
            <div key={title}>
              <h4 className="text-[10px] tracking-[0.22em] uppercase text-orange font-medium mb-5">
                {title}
              </h4>
              <ul className="space-y-3">
                {links.map(link => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-[13px] text-cream/50 font-light
                                 hover:text-cream transition-colors duration-200"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-3">
          <p className="text-[11px] text-cream/30 font-light tracking-wide">
            © {new Date().getFullYear()} Calixto — Sabores de altura. Todos los derechos reservados.
          </p>
          <p className="text-[11px] text-cream/30 font-light">
            San Juan, Argentina
          </p>
        </div>
      </div>
    </footer>
  )
}