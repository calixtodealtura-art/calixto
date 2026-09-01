import type { Metadata } from 'next'
import CheckoutClient from './CheckoutClient'

export const metadata: Metadata = {
  title: 'Finalizar compra | Calixto',
  robots: {
    index:  false,
    follow: false,
  },
}

export default function CheckoutPage() {
  return <CheckoutClient />
}
