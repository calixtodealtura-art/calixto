import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

/** Combina clases de Tailwind sin conflictos */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/** Formatea precio en pesos argentinos */
export function formatPrice(value: number): string {
  return new Intl.NumberFormat('es-AR', {
    style:    'currency',
    currency: 'ARS',
    maximumFractionDigits: 0,
  }).format(value)
}

/** Genera un slug limpio desde un string */
export function slugify(str: string): string {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
}

/** Umbral de envío gratis (valor por defecto/fallback) */
export const FREE_SHIPPING_THRESHOLD = 0

/** Costo de envío cuando no se alcanza el mínimo (valor por defecto/fallback) */
export const DEFAULT_SHIPPING_COST = 0

export function shippingProgress(total: number, threshold: number = FREE_SHIPPING_THRESHOLD): number {
  return Math.min((total / threshold) * 100, 100)
}

export function remainingForFreeShipping(total: number, threshold: number = FREE_SHIPPING_THRESHOLD): number {
  return Math.max(threshold - total, 0)
}