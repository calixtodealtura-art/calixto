'use client'

import { useState }     from 'react'
import { ShoppingBag, Check } from 'lucide-react'
import toast            from 'react-hot-toast'
import { useCartStore } from '@/store/cartStore'
import { formatPrice }  from '@/lib/utils'
import type { Combo }   from '@/types'

export default function AddComboToCartButton({ combo }: { combo: Combo }) {
  const [added, setAdded] = useState(false)
  const { addItem, openCart } = useCartStore()

  function handleAdd() {
    // Agregamos cada producto del combo al carrito con su cantidad
    // y ajustamos el precio proporcional al precio del combo
    const totalQty = combo.items.reduce((sum, i) => sum + i.quantity, 0)

    combo.items.forEach(item => {
      // Precio proporcional: distribuimos el precio del combo según
      // el peso de cada producto en el total
      const proportion   = (item.unitPrice * item.quantity) / combo.fullPrice
      const adjustedPrice = Math.round((combo.comboPrice * proportion) / item.quantity)

      // Creamos un producto "virtual" con el precio ajustado
      const virtualProduct = {
        id:          `${item.productId}-combo-${combo.id}`,
        name:        `${item.productName} (Combo ${combo.name})`,
        slug:        item.productId,
        category:    'aceites' as const,
        description: `Parte del combo ${combo.name}`,
        shortDesc:   `Combo ${combo.name}`,
        price:       adjustedPrice,
        images:      [],
        stock:       99,
        featured:    false,
        tags:        [],
        createdAt:   new Date(),
      }

      for (let i = 0; i < item.quantity; i++) {
        addItem(virtualProduct)
      }
    })

    setAdded(true)
    toast.success(`Combo "${combo.name}" agregado al carrito`)
    openCart()
    setTimeout(() => setAdded(false), 2000)
  }

  return (
    <button
      onClick={handleAdd}
      className={`flex items-center justify-center gap-3 w-full max-w-sm py-4
                  text-[12px] tracking-[0.18em] uppercase font-medium
                  transition-all duration-300
                  ${added
                    ? 'bg-green-olive text-cream'
                    : 'bg-green-deep text-cream hover:bg-orange hover:text-green-deep'}`}
    >
      {added
        ? <><Check size={16} /> Agregado al carrito</>
        : <><ShoppingBag size={16} strokeWidth={1.5} /> Agregar combo al carrito</>
      }
    </button>
  )
}