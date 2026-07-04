import { doc, updateDoc } from 'firebase/firestore'
import { db } from './firebase'

/**
 * Vincula una orden de invitado a la cuenta del usuario logueado.
 * Las reglas de Firestore solo permiten este cambio si la orden
 * todavía tiene userId === 'guest', y solo puede tocar ese campo.
 */
export async function claimGuestOrder(orderId: string, uid: string): Promise<void> {
  await updateDoc(doc(db, 'orders', orderId), { userId: uid })
}