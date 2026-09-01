import type { Metadata } from 'next'
import MisPedidosClient from './MisPedidosClient'

export const metadata: Metadata = {
  title: 'Mis pedidos | Calixto',
  robots: {
    index:  false,
    follow: false,
  },
}

export default function MisPedidosPage() {
  return <MisPedidosClient />
}
