'use client'

import { useEffect, useState } from 'react'
import Link                    from 'next/link'
import {
  collection, getDocs, orderBy,
  query, doc, deleteDoc, updateDoc,
} from 'firebase/firestore'
import { db }          from '@/lib/firebase'
import { formatPrice } from '@/lib/utils'
import { Plus, Pencil, Trash2, Eye, EyeOff } from 'lucide-react'
import toast           from 'react-hot-toast'
import type { Combo }  from '@/types'

export default function CombosPage() {
  const [combos,  setCombos]  = useState<Combo[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { fetchCombos() }, [])

  async function fetchCombos() {
    try {
      const snap = await getDocs(
        query(collection(db, 'combos'), orderBy('createdAt', 'desc'))
      )
      setCombos(snap.docs.map(d => ({ ...d.data(), id: d.id }) as Combo))
    } catch {
      toast.error('Error cargando combos')
    } finally {
      setLoading(false)
    }
  }

  async function handleToggleActive(id: string, current: boolean) {
    try {
      await updateDoc(doc(db, 'combos', id), { active: !current })
      setCombos(prev => prev.map(c => c.id === id ? { ...c, active: !current } : c))
      toast.success(!current ? 'Combo activado' : 'Combo desactivado')
    } catch {
      toast.error('No se pudo actualizar')
    }
  }

  async function handleDelete(id: string, name: string) {
    if (!confirm(`¿Eliminar el combo "${name}"?`)) return
    try {
      await deleteDoc(doc(db, 'combos', id))
      setCombos(prev => prev.filter(c => c.id !== id))
      toast.success('Combo eliminado')
    } catch {
      toast.error('No se pudo eliminar')
    }
  }

  return (
    <div className="p-8">
      <div className="flex items-end justify-between mb-8">
        <div>
          <p className="text-[11px] tracking-[0.2em] uppercase text-green-olive font-light mb-1">
            Panel de administración
          </p>
          <h1 className="font-serif text-3xl text-green-deep font-light">Combos</h1>
        </div>
        <Link
          href="/admin/combos/nuevo"
          className="flex items-center gap-2 bg-green-deep text-cream
                     px-5 py-2.5 text-xs tracking-widest uppercase font-medium
                     hover:bg-orange transition-all duration-200"
        >
          <Plus size={14} />
          Nuevo combo
        </Link>
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-16 bg-cream-warm animate-pulse" />
          ))}
        </div>
      ) : combos.length === 0 ? (
        <div className="text-center py-24 text-green-olive font-light">
          No hay combos todavía.{' '}
          <Link href="/admin/combos/nuevo" className="underline">Crear el primero</Link>
        </div>
      ) : (
        <div className="bg-white border border-cream-warm">
          {/* Header tabla */}
          <div className="grid grid-cols-[2fr_1fr_1fr_1fr_100px] gap-4 px-5 py-3
                          border-b border-cream-warm
                          text-[10px] tracking-[0.2em] uppercase text-green-olive font-medium">
            <span>Combo</span>
            <span>Precio combo</span>
            <span>Precio normal</span>
            <span>Ahorro</span>
            <span></span>
          </div>

          {combos.map(combo => (
            <div
              key={combo.id}
              className={`grid grid-cols-[2fr_1fr_1fr_1fr_100px] gap-4 items-center
                          px-5 py-4 border-b border-cream-warm last:border-0
                          transition-colors
                          ${combo.active ? 'hover:bg-cream/30' : 'bg-gray-50 opacity-60'}`}
            >
              <div>
                <div className="flex items-center gap-2">
                  <p className="text-sm text-green-deep font-light">{combo.name}</p>
                  {!combo.active && (
                    <span className="text-[9px] tracking-wider uppercase px-2 py-0.5
                                     bg-gray-200 text-gray-500 font-medium">
                      Inactivo
                    </span>
                  )}
                  {combo.badge && (
                    <span className="text-[9px] tracking-wider uppercase px-2 py-0.5
                                     font-medium"
                          style={{ backgroundColor: '#18532c', color: '#fff0dc' }}>
                      {combo.badge}
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-gray-400 font-light mt-0.5">
                  {combo.items.length} productos · {combo.items.map(i => `${i.quantity}x ${i.productName}`).join(', ')}
                </p>
              </div>

              <span className="font-serif text-base font-semibold text-green-deep">
                {formatPrice(combo.comboPrice)}
              </span>

              <span className="font-serif text-base text-gray-400 line-through font-light">
                {formatPrice(combo.fullPrice)}
              </span>

              <span className="text-sm font-medium" style={{ color: '#ed832b' }}>
                {formatPrice(combo.savings)} off
              </span>

              <div className="flex items-center justify-end gap-2">
                <button
                  onClick={() => handleToggleActive(combo.id, combo.active)}
                  className="text-gray-400 hover:text-green-deep transition-colors"
                  title={combo.active ? 'Desactivar' : 'Activar'}
                >
                  {combo.active
                    ? <Eye size={14} strokeWidth={1.5} />
                    : <EyeOff size={14} strokeWidth={1.5} />
                  }
                </button>
                <Link
                  href={`/admin/combos/${combo.id}`}
                  className="text-gray-400 hover:text-green-deep transition-colors"
                  title="Editar"
                >
                  <Pencil size={14} strokeWidth={1.5} />
                </Link>
                <button
                  onClick={() => handleDelete(combo.id, combo.name)}
                  className="text-gray-400 hover:text-red-600 transition-colors"
                  title="Eliminar"
                >
                  <Trash2 size={14} strokeWidth={1.5} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}