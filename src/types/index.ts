// ── Categorías disponibles ─────────────────────────────────────────────────
export type ProductCategory =
  | 'aceites'
  | 'varietales'
  | 'acetos'
  | 'aceitunas'
  | 'salsas'

export const CATEGORY_LABELS: Record<ProductCategory, string> = {
  aceites:    'Aceite de Oliva',
  varietales: 'Varietal',
  acetos:     'Aceto',
  aceitunas:  'Aceitunas',
  salsas:     'Salsa',
}

// ── Producto ───────────────────────────────────────────────────────────────
export interface Product {
  id:          string
  name:        string
  slug:        string
  category:    ProductCategory
  description: string
  shortDesc:   string
  price:       number
  oldPrice?:   number
  images:      string[]       // URLs de Firebase Storage
  badge?:      string
  stock:       number
  featured:    boolean
  volume?:     string         // ej. "500ml", "250g"
  origin?:     string         // ej. "San Juan, Argentina"
  acidity?:    string         // solo para aceites
  tags:        string[]
  createdAt:   Date
}

// ── Carrito ────────────────────────────────────────────────────────────────
export interface CartItem {
  product:  Product
  quantity: number
}

export interface CartState {
  items:        CartItem[]
  isOpen:       boolean
  addItem:      (product: Product) => void
  removeItem:   (productId: string) => void
  updateQty:    (productId: string, quantity: number) => void
  clearCart:    () => void
  openCart:     () => void
  closeCart:    () => void
  total:        () => number
  itemCount:    () => number
}

// ── Usuario / Auth ─────────────────────────────────────────────────────────
export interface UserProfile {
  uid:         string
  email:       string | null
  displayName: string | null
  photoURL:    string | null
  createdAt:   Date
}

// ── Orden ──────────────────────────────────────────────────────────────────
export type OrderStatus = 'pendiente' | 'confirmado' | 'enviado' | 'entregado'

export interface OrderItem {
  productId:   string
  productName: string
  price:       number
  quantity:    number
  image:       string
}

export interface ShippingAddress {
  fullName:  string
  address:   string
  city:      string
  province:  string
  zipCode:   string
  phone:     string
}

export interface Order {
  id:              string
  userId:          string
  items:           OrderItem[]
  shippingAddress: ShippingAddress
  total:           number
  status:          OrderStatus
  createdAt:       Date
    paymentId?:     string
  paymentStatus?: string
  paymentMethod?: string
  paidAt?:        Date | null
  updatedAt?:     Date
}
