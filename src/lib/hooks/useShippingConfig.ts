'use client'

import { useEffect, useState } from 'react'
import { doc, getDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { FREE_SHIPPING_THRESHOLD, DEFAULT_SHIPPING_COST } from '@/lib/utils'

interface ShippingConfig {
  threshold:              number | null
  shippingCost:           number | null
  pickupAddress:          string | null
  pickupHours:            string | null
  interiorContactMessage: string | null
  interiorContactLink:    string | null
  loading:                boolean
}

const DEFAULT_PICKUP_ADDRESS  = ''
const DEFAULT_PICKUP_HOURS    = ''
const DEFAULT_INTERIOR_MSG    = 'Escribinos para coordinar el costo y la forma de envío.'
const DEFAULT_INTERIOR_LINK   = ''

export function useShippingConfig(): ShippingConfig {
  const [threshold, setThreshold]                       = useState<number | null>(null)
  const [shippingCost, setShippingCost]                 = useState<number | null>(null)
  const [pickupAddress, setPickupAddress]               = useState<string | null>(null)
  const [pickupHours, setPickupHours]                   = useState<string | null>(null)
  const [interiorContactMessage, setInteriorContactMsg] = useState<string | null>(null)
  const [interiorContactLink, setInteriorContactLink]   = useState<string | null>(null)
  const [loading, setLoading]                           = useState(true)

  useEffect(() => {
    let active = true

    async function fetchConfig() {
      try {
        const snap = await getDoc(doc(db, 'settings', 'shipping'))
        if (!active) return

        const data = snap.exists() ? snap.data() : {}

        const thresholdValue = data.freeShippingMinimum
        setThreshold(
          typeof thresholdValue === 'number' && thresholdValue >= 0
            ? thresholdValue
            : FREE_SHIPPING_THRESHOLD
        )

        const costValue = data.shippingCost
        setShippingCost(
          typeof costValue === 'number' && costValue >= 0
            ? costValue
            : DEFAULT_SHIPPING_COST
        )

        setPickupAddress(
          typeof data.pickupAddress === 'string' ? data.pickupAddress : DEFAULT_PICKUP_ADDRESS
        )
        setPickupHours(
          typeof data.pickupHours === 'string' ? data.pickupHours : DEFAULT_PICKUP_HOURS
        )
        setInteriorContactMsg(
          typeof data.interiorContactMessage === 'string' && data.interiorContactMessage.length > 0
            ? data.interiorContactMessage
            : DEFAULT_INTERIOR_MSG
        )
        setInteriorContactLink(
          typeof data.interiorContactLink === 'string' ? data.interiorContactLink : DEFAULT_INTERIOR_LINK
        )
      } catch {
        if (active) {
          setThreshold(FREE_SHIPPING_THRESHOLD)
          setShippingCost(DEFAULT_SHIPPING_COST)
          setPickupAddress(DEFAULT_PICKUP_ADDRESS)
          setPickupHours(DEFAULT_PICKUP_HOURS)
          setInteriorContactMsg(DEFAULT_INTERIOR_MSG)
          setInteriorContactLink(DEFAULT_INTERIOR_LINK)
        }
      } finally {
        if (active) setLoading(false)
      }
    }

    fetchConfig()
    return () => { active = false }
  }, [])

  return {
    threshold,
    shippingCost,
    pickupAddress,
    pickupHours,
    interiorContactMessage,
    interiorContactLink,
    loading,
  }
}