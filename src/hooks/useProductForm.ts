'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { doc, getDoc, addDoc, updateDoc, collection, Timestamp } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { normalizeProduct } from '@/lib/firestore'
import { slugify } from '@/lib/utils'
import toast from 'react-hot-toast'
import type { Product } from '@/types'

// Igual que Product, pero price/stock/oldPrice pueden valer '' temporalmente
// mientras el usuario edita el campo (así no se le queda un 0 "pegado" al borrar).
export type ProductFormState = Omit<Product, 'id' | 'createdAt' | 'price' | 'stock' | 'oldPrice'> & {
  price:    number | ''
  stock:    number | ''
  oldPrice: number | '' | undefined
}

const EMPTY: ProductFormState = {
  name:        '',
  slug:        '',
  category:    'aceites',
  description: '',
  shortDesc:   '',
  price:       0,
  oldPrice:    undefined,
  images:      [],
  badge:       '',
  stock:       0,
  featured:    false,
  volume:      '',
  origin:      'Cuyo, Argentina',
  acidity:     '',
  tags:        [],
}

export function useProductForm(id: string, isNew: boolean) {
  const router = useRouter()
  const [form,    setForm]    = useState<ProductFormState>(EMPTY)
  const [loading, setLoading] = useState(!isNew)
  const [saving,  setSaving]  = useState(false)

  // Cargar producto existente
  useEffect(() => {
    if (isNew) return
    async function load() {
      try {
        const snap = await getDoc(doc(db, 'products', id))
        if (!snap.exists()) {
          toast.error('Producto no encontrado')
          router.push('/admin/productos')
          return
        }
        const data = normalizeProduct(snap.id, snap.data())
        setForm({
          name:        data.name        ?? '',
          slug:        data.slug        ?? '',
          category:    data.category    ?? 'aceites',
          description: data.description ?? '',
          shortDesc:   data.shortDesc   ?? '',
          price:       data.price       ?? 0,
          oldPrice:    data.oldPrice,
          images:      data.images      ?? [],
          badge:       data.badge       ?? '',
          stock:       data.stock       ?? 0,
          featured:    data.featured    ?? false,
          volume:      data.volume      ?? '',
          origin:      data.origin      ?? '',
          acidity:     data.acidity     ?? '',
          tags:        data.tags        ?? [],
        })
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [id, isNew, router])

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) {
    const { name, value, type } = e.target
    // Para inputs numéricos: si el campo queda vacío, guardamos '' en vez de
    // forzar un 0, así el estado realmente puede estar "vacío" y no se
    // le queda pegado el cero cuando el usuario borra el contenido.
    const val =
      type === 'checkbox'
        ? (e.target as HTMLInputElement).checked
        : type === 'number'
          ? (value === '' ? '' : Number(value))
          : value

    setForm(prev => {
      const updated = { ...prev, [name]: val } as ProductFormState
      if (name === 'name') updated.slug = slugify(value)
      return updated
    })
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    // Normalizamos precio y stock a número por si quedaron en '' (vacío)
    // mientras el usuario editaba el campo.
    const price = Number(form.price) || 0
    const stock = Number(form.stock) || 0
    const oldPrice =
      form.oldPrice === '' || form.oldPrice === undefined
        ? undefined
        : Number(form.oldPrice)

    if (!form.name || !price) {
      toast.error('Nombre y precio son obligatorios')
      return
    }

    setSaving(true)
    try {
      const payload = { ...form, price, stock, oldPrice }

      if (isNew) {
        await addDoc(collection(db, 'products'), {
          ...payload,
          createdAt: Timestamp.now(),
        })
        toast.success('Producto creado')
      } else {
        await updateDoc(doc(db, 'products', id), payload)
        toast.success('Producto actualizado')
      }
      router.push('/admin/productos')
    } catch (err) {
      console.error(err)
      toast.error('Error al guardar')
    } finally {
      setSaving(false)
    }
  }

  return { form, setForm, loading, saving, handleChange, handleSubmit }
}
