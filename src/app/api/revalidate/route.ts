import { NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { isRequestFromAdmin } from '@/lib/adminAuth'

// Invalida la caché de la tienda después de un cambio en el admin, para que
// productos, combos, imágenes y stock se vean al instante y no tras 1–5 minutos.
export async function POST() {
  if (!(await isRequestFromAdmin())) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  revalidatePath('/', 'layout')
  return NextResponse.json({ revalidated: true })
}
