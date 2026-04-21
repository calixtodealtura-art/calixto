import type { Metadata } from 'next'
import { Toaster }       from 'react-hot-toast'
import AuthProvider       from '@/components/layout/AuthProvider'
import Header             from '@/components/layout/Header'
import Footer             from '@/components/layout/Footer'
import CartDrawer         from '@/components/cart/CartDrawer'
import WhatsAppButton from '@/components/ui/WhatsAppButton'
import './globals.css'

export const metadata: Metadata = {
  title:       'Calixto — Origen & Sabor',
  description: 'Aceites de oliva virgen extra, varietales, acetos, aceitunas y salsas artesanales de los Andes sanjuaninos.',
  keywords:    ['aceite de oliva', 'virgen extra', 'San Juan', 'gourmet', 'aceto', 'aceitunas'],
  openGraph: {
    title:       'Calixto — Origen & Sabor',
    description: 'Productos gourmet de nuestros olivares de altura en San Juan, Argentina.',
    type:        'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body>
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
    </html>
  )
}
