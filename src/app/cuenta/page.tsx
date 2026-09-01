import type { Metadata } from 'next'
import CuentaClient from './CuentaClient'

export const metadata: Metadata = {
  title: 'Mi cuenta | Calixto',
  robots: {
    index:  false,
    follow: false,
  },
}

export default function CuentaPage() {
  return <CuentaClient />
}
