'use client'

import { useEffect, useState } from 'react'
import { doc, getDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { FREE_SHIPPING_THRESHOLD } from '@/lib/utils'

export function useShippingThreshold() {
  const [threshold, setThreshold] = useState(FREE_SHIPPING_THRESHOLD)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true

    async function fetchThreshold() {
      try {
        const snap = await getDoc(doc(db, 'settings', 'shipping'))
        if (active && snap.exists()) {
          const value = snap.data().freeShippingMinimum
          if (typeof value === 'number' && value >= 0) {
            setThreshold(value)
          }
        }
      } catch {
        // silencioso: si falla, se usa FREE_SHIPPING_THRESHOLD como respaldo
      } finally {
        if (active) setLoading(false)
      }
    }

    fetchThreshold()
    return () => { active = false }
  }, [])

  return { threshold, loading }
}