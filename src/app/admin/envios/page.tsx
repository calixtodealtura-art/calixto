'use client'

import { useEffect, useState } from 'react'
import { doc, getDoc, setDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { Truck, Store, MapPin } from 'lucide-react'

export default function EnviosPage() {
  const [minimo, setMinimo]                   = useState<number>(0)
  const [costo, setCosto]                     = useState<number>(0)
  const [pickupAddress, setPickupAddress]     = useState<string>('')
  const [pickupHours, setPickupHours]         = useState<string>('')
  const [interiorMsg, setInteriorMsg]         = useState<string>('')
  const [interiorLink, setInteriorLink]       = useState<string>('')
  const [loading, setLoading]                 = useState(true)
  const [saving, setSaving]                   = useState(false)
  const [saved, setSaved]                     = useState(false)

  useEffect(() => {
    async function fetchConfig() {
      try {
        const ref  = doc(db, 'settings', 'shipping')
        const snap = await getDoc(ref)
        if (snap.exists()) {
          const data = snap.data()
          setMinimo(data.freeShippingMinimum ?? 0)
          setCosto(data.shippingCost ?? 0)
          setPickupAddress(data.pickupAddress ?? '')
          setPickupHours(data.pickupHours ?? '')
          setInteriorMsg(data.interiorContactMessage ?? '')
          setInteriorLink(data.interiorContactLink ?? '')
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
      await setDoc(ref, {
        freeShippingMinimum:    minimo,
        shippingCost:           costo,
        pickupAddress,
        pickupHours,
        interiorContactMessage: interiorMsg,
        interiorContactLink:    interiorLink,
      }, { merge: true })
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div className="p-8 text-sm text-gray-500">Cargando...</div>

  return (
    <div className="p-8 max-w-xl space-y-10">
      <div>
        <h1 className="font-serif text-2xl text-green-deep mb-1">Configuración de envíos</h1>
        <p className="text-sm text-gray-500">
          Definí cómo pueden recibir sus pedidos los clientes.
        </p>
      </div>

      {/* ── Envío CABA / GBA ── */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <Truck size={18} strokeWidth={1.5} />
          <h2 className="font-serif text-lg text-green-deep">Envío a CABA / GBA</h2>
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

        <label className="block text-sm text-gray-600 mb-2">
          Costo de envío si no se alcanza el mínimo ($)
        </label>
        <input
          type="number"
          min={0}
          value={costo}
          onChange={e => setCosto(Number(e.target.value))}
          className="border rounded px-3 py-2 w-full"
        />
      </section>

      {/* ── Retiro en el local ── */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <Store size={18} strokeWidth={1.5} />
          <h2 className="font-serif text-lg text-green-deep">Retiro en el local</h2>
        </div>

        <label className="block text-sm text-gray-600 mb-2">
          Dirección del local
        </label>
        <input
          type="text"
          value={pickupAddress}
          onChange={e => setPickupAddress(e.target.value)}
          placeholder="Ej: Av. Siempre Viva 123, CABA"
          className="border rounded px-3 py-2 w-full mb-4"
        />

        <label className="block text-sm text-gray-600 mb-2">
          Horarios de atención
        </label>
        <input
          type="text"
          value={pickupHours}
          onChange={e => setPickupHours(e.target.value)}
          placeholder="Ej: Lunes a viernes de 9 a 18hs"
          className="border rounded px-3 py-2 w-full"
        />
      </section>

      {/* ── Envío al interior ── */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <MapPin size={18} strokeWidth={1.5} />
          <h2 className="font-serif text-lg text-green-deep">Envío al interior</h2>
        </div>

        <label className="block text-sm text-gray-600 mb-2">
          Mensaje para el cliente
        </label>
        <textarea
          value={interiorMsg}
          onChange={e => setInteriorMsg(e.target.value)}
          placeholder="Ej: Escribinos para coordinar el costo y la forma de envío."
          rows={2}
          className="border rounded px-3 py-2 w-full mb-4"
        />

        <label className="block text-sm text-gray-600 mb-2">
          Link de contacto (WhatsApp, opcional)
        </label>
        <input
          type="text"
          value={interiorLink}
          onChange={e => setInteriorLink(e.target.value)}
          placeholder="https://wa.me/5491122223333"
          className="border rounded px-3 py-2 w-full"
        />
      </section>

      <button
        onClick={handleSave}
        disabled={saving}
        className="bg-green-deep text-cream px-4 py-2 rounded text-sm"
      >
        {saving ? 'Guardando...' : 'Guardar'}
      </button>

      {saved && <p className="text-green-600 text-sm">✓ Guardado</p>}
    </div>
  )
}