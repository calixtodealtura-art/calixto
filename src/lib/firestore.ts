import {
  collection,
  getDocs,
  getCountFromServer,
  query,
  where,
  orderBy,
  limit,
  Timestamp,
  type QueryConstraint,
} from 'firebase/firestore'
import { db } from './firebase'
import type { Product, Order, Combo, ProductCategory } from '@/types'

// ── Helpers ────────────────────────────────────────────────────────────────
function toDate(val: unknown): Date {
  if (val instanceof Timestamp) return val.toDate()
  if (val instanceof Date) return val
  return new Date()
}

// Normaliza un doc crudo de Firestore (createdAt como Timestamp) al tipo de
// la app (createdAt como Date). Exportado para que las páginas de admin que
// leen estas colecciones directamente no casteen `as Product`/`as Combo` a
// mano y se olviden de convertir el Timestamp.
export function normalizeProduct(id: string, data: Record<string, unknown>): Product {
  return {
    ...data,
    id,
    createdAt: toDate(data.createdAt),
  } as Product
}

export function normalizeCombo(id: string, data: Record<string, unknown>): Combo {
  return {
    ...data,
    id,
    createdAt: toDate(data.createdAt),
  } as Combo
}

export function normalizeOrder(id: string, data: Record<string, unknown>): Order {
  return {
    ...data,
    id,
    createdAt: toDate(data.createdAt),
  } as Order
}

// ── Productos ──────────────────────────────────────────────────────────────
const PRODUCTS_COL = 'products'

export async function getProducts(opts?: {
  category?: ProductCategory
  featured?: boolean
  limitN?:   number
}): Promise<Product[]> {
  const constraints: QueryConstraint[] = [orderBy('createdAt', 'desc')]

  if (opts?.category) constraints.push(where('category', '==', opts.category))
  if (opts?.featured)  constraints.push(where('featured', '==', true))
  if (opts?.limitN)    constraints.push(limit(opts.limitN))

  const snap = await getDocs(query(collection(db, PRODUCTS_COL), ...constraints))
  return snap.docs.map(d => normalizeProduct(d.id, d.data()))
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  const snap = await getDocs(
    query(collection(db, PRODUCTS_COL), where('slug', '==', slug), limit(1))
  )
  if (snap.empty) return null
  const d = snap.docs[0]
  return normalizeProduct(d.id, d.data())
}

// Conteo por categoría vía aggregation query — no descarga los documentos,
// solo el número. Usado por el home y por el menú de navegación.
export async function getProductCountByCategory(category: ProductCategory): Promise<number> {
  const snap = await getCountFromServer(
    query(collection(db, PRODUCTS_COL), where('category', '==', category))
  )
  return snap.data().count
}

// ── Combos ─────────────────────────────────────────────────────────────────
const COMBOS_COL = 'combos'

export async function getCombos(): Promise<Combo[]> {
  const snap = await getDocs(
    query(
      collection(db, COMBOS_COL),
      where('active', '==', true),
      orderBy('createdAt', 'desc')
    )
  )
  return snap.docs.map(d => normalizeCombo(d.id, d.data()))
}

export async function getComboSlugs(): Promise<string[]> {
  const snap = await getDocs(
    query(collection(db, COMBOS_COL), where('active', '==', true))
  )
  return snap.docs.map(d => (d.data() as Combo).slug)
}

export async function getComboBySlug(slug: string): Promise<Combo | null> {
  const snap = await getDocs(
    query(
      collection(db, COMBOS_COL),
      where('slug',   '==', slug),
      where('active', '==', true),
      limit(1)
    )
  )
  if (snap.empty) return null
  const d = snap.docs[0]
  return normalizeCombo(d.id, d.data())
}

// ── Órdenes ────────────────────────────────────────────────────────────────
const ORDERS_COL = 'orders'

export async function getOrdersByUser(userId: string): Promise<Order[]> {
  const snap = await getDocs(
    query(
      collection(db, ORDERS_COL),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    )
  )
  return snap.docs.map(d => normalizeOrder(d.id, d.data()))
}
