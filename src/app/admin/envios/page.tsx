'use client'

import { useEffect, useState } from 'react'
import { doc, getDoc, setDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { Truck } from 'lucide-react'

export default function EnviosPage() {
  const [minimo, setMinimo] = useState<number>(0)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    async function fetchConfig() {
      try {
        const ref = doc(db, 'settings', 'shipping')
        const snap = await getDoc(ref)
        if (snap.exists()) {
          setMinimo(snap.data().freeShippingMinimum ?? 0)
        }
      } finally {
        setLoading(false)
      }
    }
    fetchConfig()
  }, [])

  async function handleSave() {
    setSaving(true)
    setSaved(false)
    try {
      const ref = doc(db, 'settings', 'shipping')
      await setDoc(ref, { freeShippingMinimum: minimo }, { merge: true })
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div className="p-8 text-sm text-gray-500">Cargando...</div>

  return (
    <div className="p-8 max-w-md">
      <div className="flex items-center gap-2 mb-6">
        <Truck size={18} strokeWidth={1.5} />
        <h1 className="font-serif text-xl">Configuración de envíos</h1>
      </div>

      <label className="block text-sm text-gray-600 mb-2">
        Compra mínima para envío gratis ($)
      </label>
      <input
        type="number"
        min={0}
        value={minimo}
        onChange={e => setMinimo(Number(e.target.value))}
        className="border rounded px-3 py-2 w-full mb-4"
      />

      <button
        onClick={handleSave}
        disabled={saving}
        className="bg-green-deep text-cream px-4 py-2 rounded text-sm"
      >
        {saving ? 'Guardando...' : 'Guardar'}
      </button>

      {saved && <p className="text-green-600 text-sm mt-2">✓ Guardado</p>}
    </div>
  )
}