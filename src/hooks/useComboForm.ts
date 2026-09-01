'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { doc, getDoc, addDoc, updateDoc, collection, Timestamp } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { normalizeCombo } from '@/lib/firestore'
import { slugify } from '@/lib/utils'
import toast from 'react-hot-toast'
import type { Product, ComboItem } from '@/types'

interface ComboFormState {
  name:        string
  slug:        string
  description: string
  comboPrice:  number
  badge:       string
  featured:    boolean
  active:      boolean
}

const EMPTY_COMBO: ComboFormState = {
  name:        '',
  slug:        '',
  description: '',
  comboPrice:  0,
  badge:       '',
  featured:    false,
  active:      true,
}

export function useComboForm(id: string, isNew: boolean) {
  const router = useRouter()
  const [form,    setForm]    = useState<ComboFormState>(EMPTY_COMBO)
  const [items,   setItems]   = useState<ComboItem[]>([])
  const [loading, setLoading] = useState(!isNew)
  const [saving,  setSaving]  = useState(false)

  // Cargar combo existente si es edición
  useEffect(() => {
    if (isNew) return
    async function loadCombo() {
      try {
        const snap = await getDoc(doc(db, 'combos', id))
        if (!snap.exists()) { toast.error('Combo no encontrado'); router.push('/admin/combos'); return }
        const data = normalizeCombo(snap.id, snap.data())
        setForm({
          name:        data.name,
          slug:        data.slug,
          description: data.description,
          comboPrice:  data.comboPrice,
          badge:       data.badge ?? '',
          featured:    data.featured,
          active:      data.active,
        })
        setItems(data.items)
      } catch (err) {
        console.error(err)
        toast.error('Error cargando el combo')
      } finally {
        setLoading(false)
      }
    }
    loadCombo()
  }, [id, isNew, router])

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    const { name, value, type } = e.target
    const val = type === 'checkbox'
      ? (e.target as HTMLInputElement).checked
      : type === 'number' ? Number(value) : value

    setForm(prev => {
      const updated = { ...prev, [name]: val }
      if (name === 'name') updated.slug = slugify(value)
      return updated
    })
  }

  // Agregar producto al combo
  function addProduct(product: Product) {
    const existing = items.find(i => i.productId === product.id)
    if (existing) {
      setItems(prev => prev.map(i =>
        i.productId === product.id ? { ...i, quantity: i.quantity + 1 } : i
      ))
    } else {
      setItems(prev => [...prev, {
        productId:   product.id,
        productName: product.name,
        quantity:    1,
        unitPrice:   product.price,
      }])
    }
  }

  function updateQty(productId: string, qty: number) {
    if (qty <= 0) {
      setItems(prev => prev.filter(i => i.productId !== productId))
    } else {
      setItems(prev => prev.map(i =>
        i.productId === productId ? { ...i, quantity: qty } : i
      ))
    }
  }

  function removeItem(productId: string) {
    setItems(prev => prev.filter(i => i.productId !== productId))
  }

  // Cálculos derivados
  const fullPrice   = items.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0)
  const savings     = fullPrice - form.comboPrice
  const savingsPct  = fullPrice > 0 ? Math.round((savings / fullPrice) * 100) : 0

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (items.length < 2) { toast.error('El combo debe tener al menos 2 productos'); return }
    if (form.comboPrice <= 0) { toast.error('El precio del combo debe ser mayor a 0'); return }
    if (savings < 0) { toast.error('El precio del combo no puede ser mayor al precio individual'); return }

    setSaving(true)
    try {
      const comboData = {
        ...form,
        items,
        fullPrice,
        savings,
        images: [],
      }

      if (isNew) {
        await addDoc(collection(db, 'combos'), {
          ...comboData,
          createdAt: Timestamp.now(),
        })
        toast.success('Combo creado')
      } else {
        await updateDoc(doc(db, 'combos', id), comboData)
        toast.success('Combo actualizado')
      }
      router.push('/admin/combos')
    } catch {
      toast.error('Error al guardar')
    } finally {
      setSaving(false)
    }
  }

  return {
    form, handleChange,
    items, addProduct, updateQty, removeItem,
    fullPrice, savings, savingsPct,
    loading, saving, handleSubmit,
  }
}
