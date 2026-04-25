'use client'

import { useEffect, useState } from 'react'
import {
  collection, getDocs, orderBy,
  query, doc, updateDoc, deleteDoc,
} from 'firebase/firestore'
import { db }   from '@/lib/firebase'
import toast    from 'react-hot-toast'
import { Trash2, Mail, MailOpen, ChevronDown, ChevronUp } from 'lucide-react'

interface ContactMessage {
  id:        string
  name:      string
  email:     string
  subject:   string
  message:   string
  read:      boolean
  createdAt: Date
}

const SUBJECT_LABELS: Record<string, string> = {
  pedido:    'Consulta sobre un pedido',
  producto:  'Consulta sobre un producto',
  envio:     'Envíos y entregas',
  mayorista: 'Compras mayoristas',
  otro:      'Otro',
}

export default function MensajesPage() {
  const [messages,  setMessages]  = useState<ContactMessage[]>([])
  const [loading,   setLoading]   = useState(true)
  const [expanded,  setExpanded]  = useState<string | null>(null)
  const [filter,    setFilter]    = useState<'todos' | 'no-leidos' | 'leidos'>('todos')

  useEffect(() => {
    fetchMessages()
  }, [])

  async function fetchMessages() {
    try {
      const snap = await getDocs(
        query(collection(db, 'contacts'), orderBy('createdAt', 'desc'))
      )
      setMessages(snap.docs.map(d => ({
        ...d.data(),
        id:        d.id,
        createdAt: d.data().createdAt?.toDate?.() ?? new Date(),
      })) as ContactMessage[])
    } catch {
      toast.error('Error cargando mensajes')
    } finally {
      setLoading(false)
    }
  }

  async function handleToggleRead(id: string, currentRead: boolean) {
    try {
      await updateDoc(doc(db, 'contacts', id), { read: !currentRead })
      setMessages(prev =>
        prev.map(m => m.id === id ? { ...m, read: !currentRead } : m)
      )
    } catch {
      toast.error('No se pudo actualizar el mensaje')
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('¿Eliminar este mensaje? Esta acción no se puede deshacer.')) return
    try {
      await deleteDoc(doc(db, 'contacts', id))
      setMessages(prev => prev.filter(m => m.id !== id))
      toast.success('Mensaje eliminado')
    } catch {
      toast.error('No se pudo eliminar el mensaje')
    }
  }

  function handleExpand(id: string) {
    setExpanded(expanded === id ? null : id)
    // Marcar como leído automáticamente al abrir
    const msg = messages.find(m => m.id === id)
    if (msg && !msg.read) handleToggleRead(id, false)
  }

  const filtered = messages.filter(m => {
    if (filter === 'no-leidos') return !m.read
    if (filter === 'leidos')    return m.read
    return true
  })

  const unreadCount = messages.filter(m => !m.read).length

  return (
    <div className="p-8">

      {/* Header */}
      <div className="flex items-end justify-between mb-8">
        <div>
          <p className="text-[11px] tracking-[0.2em] uppercase text-green-olive font-light mb-1">
            Panel de administración
          </p>
          <div className="flex items-center gap-3">
            <h1 className="font-serif text-3xl text-green-deep font-light">Mensajes</h1>
            {unreadCount > 0 && (
              <span className="text-[11px] font-medium px-2.5 py-1 rounded-full"
                    style={{ backgroundColor: '#ed832b', color: '#18532c' }}>
                {unreadCount} sin leer
              </span>
            )}
          </div>
        </div>

        {/* Botón responder por email abre cliente de email */}
      </div>

      {/* Filtros */}
      <div className="flex gap-3 mb-8">
        {([
          { key: 'todos',     label: `Todos (${messages.length})`         },
          { key: 'no-leidos', label: `Sin leer (${unreadCount})`          },
          { key: 'leidos',    label: `Leídos (${messages.length - unreadCount})` },
        ] as { key: typeof filter; label: string }[]).map(f => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`text-[11px] tracking-[0.12em] uppercase px-4 py-2 border
                        transition-all duration-200 font-light
                        ${filter === f.key
                          ? 'bg-green-deep text-cream border-green-deep'
                          : 'border-cream-warm text-green-deep hover:border-orange hover:text-orange'}`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Lista de mensajes */}
      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-16 bg-cream-warm animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-24 text-green-olive font-light">
          {filter === 'no-leidos' ? 'No hay mensajes sin leer' : 'No hay mensajes todavía'}
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map(msg => (
            <div
              key={msg.id}
              className={`border transition-all duration-200
                          ${!msg.read
                            ? 'border-orange/40 bg-orange/5'
                            : 'border-cream-warm bg-white'}`}
            >
              {/* Fila principal */}
              <div
                className="grid grid-cols-[auto_1fr_160px_120px_80px] gap-4 items-center
                           px-5 py-4 cursor-pointer hover:bg-cream/30 transition-colors"
                onClick={() => handleExpand(msg.id)}
              >
                {/* Ícono leído/no leído */}
                <div className={!msg.read ? 'text-orange' : 'text-gray-300'}>
                  {!msg.read
                    ? <Mail size={16} strokeWidth={1.5} />
                    : <MailOpen size={16} strokeWidth={1.5} />
                  }
                </div>

                {/* Nombre + asunto */}
                <div className="min-w-0">
                  <div className="flex items-center gap-3">
                    <span className={`text-sm truncate
                                      ${!msg.read ? 'text-green-deep font-medium' : 'text-green-deep font-light'}`}>
                      {msg.name}
                    </span>
                    {!msg.read && (
                      <span className="w-2 h-2 rounded-full bg-orange shrink-0" />
                    )}
                  </div>
                  <p className="text-[11px] text-gray-400 font-light truncate mt-0.5">
                    {SUBJECT_LABELS[msg.subject] ?? msg.subject}
                  </p>
                </div>

                {/* Email */}
                <span className="text-[11px] text-gray-400 font-light truncate hidden md:block">
                  {msg.email}
                </span>

                {/* Fecha */}
                <span className="text-[11px] text-gray-400 font-light whitespace-nowrap">
                  {msg.createdAt instanceof Date
                    ? msg.createdAt.toLocaleDateString('es-AR', {
                        day:   '2-digit',
                        month: 'short',
                        year:  'numeric',
                      })
                    : '—'}
                </span>

                {/* Acciones */}
                <div
                  className="flex items-center justify-end gap-2"
                  onClick={e => e.stopPropagation()}
                >
                  <button
                    onClick={() => handleToggleRead(msg.id, msg.read)}
                    className="text-gray-300 hover:text-green-deep transition-colors"
                    title={msg.read ? 'Marcar como no leído' : 'Marcar como leído'}
                  >
                    {msg.read
                      ? <Mail size={14} strokeWidth={1.5} />
                      : <MailOpen size={14} strokeWidth={1.5} />
                    }
                  </button>
                  <button
                    onClick={() => handleDelete(msg.id)}
                    className="text-gray-300 hover:text-red-600 transition-colors"
                    title="Eliminar"
                  >
                    <Trash2 size={14} strokeWidth={1.5} />
                  </button>
                  <span className="text-gray-300 ml-1">
                    {expanded === msg.id
                      ? <ChevronUp size={14} />
                      : <ChevronDown size={14} />
                    }
                  </span>
                </div>
              </div>

              {/* Contenido expandido */}
              {expanded === msg.id && (
                <div
                  className="px-5 py-5 border-t border-cream-warm"
                  style={{ backgroundColor: '#fdfaf5' }}
                >
                  <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-6 items-start">

                    {/* Mensaje */}
                    <div>
                      <p className="text-[10px] tracking-[0.2em] uppercase text-green-olive
                                    font-medium mb-3">
                        Mensaje
                      </p>
                      <p className="text-sm text-green-deep font-light leading-relaxed
                                    whitespace-pre-wrap">
                        {msg.message}
                      </p>
                    </div>

                    {/* Datos + acciones */}
                    <div className="flex flex-col gap-3 min-w-[200px]">
                      <div>
                        <p className="text-[10px] tracking-[0.15em] uppercase text-green-olive
                                      font-light mb-1">
                          Remitente
                        </p>
                        <p className="text-sm text-green-deep font-medium">{msg.name}</p>
                        <p className="text-[12px] text-gray-500 font-light">{msg.email}</p>
                      </div>

                      <div>
                        <p className="text-[10px] tracking-[0.15em] uppercase text-green-olive
                                      font-light mb-1">
                          Motivo
                        </p>
                        <p className="text-[12px] text-green-deep font-light">
                          {SUBJECT_LABELS[msg.subject] ?? msg.subject}
                        </p>
                      </div>

                      <div>
                        <p className="text-[10px] tracking-[0.15em] uppercase text-green-olive
                                      font-light mb-1">
                          Recibido
                        </p>
                        <p className="text-[12px] text-green-deep font-light">
                          {msg.createdAt instanceof Date
                            ? msg.createdAt.toLocaleDateString('es-AR', {
                                day:    '2-digit',
                                month:  'long',
                                year:   'numeric',
                                hour:   '2-digit',
                                minute: '2-digit',
                              })
                            : '—'}
                        </p>
                      </div>

                      {/* Botón responder */}
                      <a
                        href={`mailto:${msg.email}?subject=Re: ${SUBJECT_LABELS[msg.subject] ?? msg.subject}`}
                        className="flex items-center justify-center gap-2 mt-2
                                   text-[11px] tracking-widest uppercase font-medium
                                   px-4 py-2.5 transition-all duration-200
                                   bg-green-deep text-cream hover:bg-orange"
                      >
                        <Mail size={13} strokeWidth={1.5} />
                        Responder
                      </a>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}