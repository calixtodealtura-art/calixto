import type { Metadata } from 'next'
import ContactoForm from './ContactoForm'

export const metadata: Metadata = {
  title: 'Contacto | Calixto — Origen & Sabor',
  description: 'Escribinos por consultas sobre pedidos, productos, envíos o compras mayoristas. Estamos para escucharte.',
  alternates: {
    canonical: '/contacto',
  },
}

export default function ContactoPage() {
  return <ContactoForm />
}
