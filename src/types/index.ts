// ── Categorías disponibles ─────────────────────────────────────────────────
export type ProductCategory =
  | 'aceites'
  | 'varietales'
  | 'acetos'
  | 'aceitunas'
  | 'especiales'

export const CATEGORY_LABELS: Record<ProductCategory, string> = {
  aceites:    'Aceite de Oliva',
  varietales: 'Varietal',
  acetos:     'Aceto',
  aceitunas:  'Aceitunas',
  especiales:     'Especiales Gourmet',
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
  role?:       'admin' | 'customer'
  createdAt:   Date
}

// ── Envío / Entrega ────────────────────────────────────────────────────────
export type DeliveryMethod =
  | 'retiro'          // retiro en el local
  | 'envio_caba_gba'  // envío calculado automáticamente
  | 'envio_interior'  // envío a coordinar/cobrar aparte

export const DELIVERY_METHOD_LABELS: Record<DeliveryMethod, string> = {
  retiro:          'Retiro en el local',
  envio_caba_gba:  'Envío a CABA / GBA',
  envio_interior:  'Envío al interior',
}

// ── Orden ──────────────────────────────────────────────────────────────────
export type OrderStatus =
  | 'pendiente'
  | 'pagado'
  | 'confirmado'
  | 'enviado'
  | 'entregado'
  | 'rechazado'
  | 'cancelado'
  | 'reembolsado'

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

/** Datos mínimos para coordinar el retiro en el local (sin dirección) */
export interface PickupContact {
  fullName: string
  phone:    string
}

export interface Order {
  id:               string
  userId:           string
  items:            OrderItem[]
  deliveryMethod:   DeliveryMethod
  shippingAddress?: ShippingAddress   // presente solo si deliveryMethod !== 'retiro'
  pickupContact?:   PickupContact     // presente solo si deliveryMethod === 'retiro'
  shippingCost:     number            // 0 para retiro y envío al interior (se cobra aparte)
  shippingPending:  boolean           // true solo si deliveryMethod === 'envio_interior'
  stockDeducted?:   boolean           // true una vez que se descontó el stock de esta orden
  total:            number
  status:           OrderStatus
  createdAt:        Date
  paymentId?:     string
  paymentStatus?: string
  paymentMethod?: string
  paidAt?:        Date | null
  updatedAt?:     Date
}
// ─────────────────────────────────────────────────────────────
// COMBOS
// ─────────────────────────────────────────────────────────────

export interface ComboItem {
  productId:   string
  productName: string
  quantity:    number
  unitPrice:   number  // precio individual al momento de crear el combo
}

export interface Combo {
  id:          string
  name:        string
  slug:        string
  description: string
  items:       ComboItem[]
  comboPrice:  number    // precio promocional
  fullPrice:   number    // suma de precios individuales (calculado)
  savings:     number    // fullPrice - comboPrice (calculado)
  images:      string[]
  featured:    boolean
  active:      boolean
  badge?:      string
  createdAt:   Date
}