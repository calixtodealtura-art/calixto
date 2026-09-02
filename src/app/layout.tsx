import type { Metadata } from 'next'
import { Toaster }       from 'react-hot-toast'
import AuthProvider       from '@/components/layout/AuthProvider'
import Header             from '@/components/layout/Header'
import Footer             from '@/components/layout/Footer'
import CartDrawer         from '@/components/cart/CartDrawer'
import WhatsAppButton from '@/components/ui/WhatsAppButton'
import JsonLd          from '@/components/seo/JsonLd'
import './globals.css'
import { GoogleAnalytics } from '@next/third-parties/google'

const organizationJsonLd = {
  '@context': 'https://schema.org',
  '@type':    'Organization',
  name:       'Calixto — Sabores de Altura',
  url:        'https://calixto.ar',
  logo:       'https://calixto.ar/logo-principal-verde.svg',
  sameAs: [
    'https://instagram.com/calixto',
    'https://facebook.com/calixto',
  ],
}

export const metadata: Metadata = {
  metadataBase: new URL('https://calixto.ar'),
  title:       'Calixto — Sabores de Altura',
  description: 'Aceites de oliva virgen extra, varietales, acetos, aceitunas y salsas artesanales de los Andes.',
  keywords:    ['aceite de oliva', 'virgen extra', 'Cuyo', 'gourmet', 'aceto', 'aceitunas'],
  openGraph: {
    title:       'Calixto — Sabores de Altura',
    description: 'Productos gourmet de nuestros olivares de altura en Cuyo, Argentina.',
    type:        'website',
    url:         '/',
    siteName:    'Calixto — Sabores de Altura',
    images: [
      {
        url:    '/og-default.png', // 👈 imagen genérica del sitio, poné el archivo en /public
        width:  1200,
        height: 630,
        alt:    'Calixto — Sabores de Altura',
      },
    ],
    locale: 'es_AR',
  },
  twitter: {
    card:        'summary_large_image',
    title:       'Calixto — Sabores de Altura',
    description: 'Productos gourmet de nuestros olivares de altura en Cuyo, Argentina.',
    images:      ['/og-default.png'],
  },
}

const GA_ID = process.env.NEXT_PUBLIC_GA_ID

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body>
        <JsonLd data={organizationJsonLd} />
        <AuthProvider>
          <Header />
          <CartDrawer />
          <WhatsAppButton />
          <main>{children}</main>
          <Toaster
            position="bottom-center"
            toastOptions={{
              style: {
                background:   '#1a2e1a',
                color:        '#f5f0e8',
                borderLeft:   '3px solid #c9a84c',
                borderRadius: '0',
                fontFamily:   'Jost, sans-serif',
                fontSize:     '0.8rem',
                letterSpacing: '0.05em',
              },
            }}
          />
          <Footer />
        </AuthProvider>
      </body>
      {GA_ID && <GoogleAnalytics gaId={GA_ID} />}
    </html>
  )
}