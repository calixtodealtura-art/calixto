'use client'

import { useState }  from 'react'
import { db }        from '@/lib/firebase'
import { addDoc, collection, Timestamp } from 'firebase/firestore'
import toast         from 'react-hot-toast'

const CONTACT_INFO = [
  {
    label: 'Email',
    value: 'calixtodealtura@gmail.com',
    href:  'mailto:calixtodealtura@gmail.com',
  },
  {
    label: 'WhatsApp',
    value: '+54 9 11 3905-6519',
    href:  'https://wa.me/5491139056519',
  },
]

const SOCIAL = [
  { label: 'Instagram', href: 'https://instagram.com/calixto' },
  { label: 'Facebook',  href: 'https://facebook.com/calixto'  },
]

const EMPTY = { name: '', email: '', subject: '', message: '' }

export default function ContactoPage() {
  const [form,    setForm]    = useState(EMPTY)
  const [loading, setLoading] = useState(false)
  const [sent,    setSent]    = useState(false)

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      await addDoc(collection(db, 'contacts'), {
        ...form,
        createdAt: Timestamp.now(),
        read:      false,
      })
      setSent(true)
      setForm(EMPTY)
      toast.success('Mensaje enviado correctamente')
    } catch {
      toast.error('No se pudo enviar el mensaje. Intentá de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-ivory min-h-screen">

      {/* ── HERO ── */}
      <section
        className="px-8 md:px-20 py-20"
        style={{ backgroundColor: '#18532c' }}
      >
        <p className="text-[11px] tracking-[0.28em] uppercase font-light mb-4"
           style={{ color: '#ed832b' }}>
          Contacto
        </p>
        <h1
          className="font-serif font-light text-cream leading-tight"
          style={{ fontSize: 'clamp(2.5rem, 5vw, 4rem)' }}
        >
          Estamos para<br />
          <em className="italic" style={{ color: '#fff0dc' }}>escucharte</em>
        </h1>
      </section>

      {/* ── CONTENIDO ── */}
      <section className="max-w-screen-lg mx-auto px-8 md:px-12 py-20
                          grid grid-cols-1 lg:grid-cols-[1fr_420px] gap-16 items-start">

        {/* Formulario */}
        <div>
          <p className="section-label">Envianos un mensaje</p>
          <h2 className="section-title mb-8">
            ¿En qué podemos<br />
            <em className="italic text-green-olive">ayudarte?</em>
          </h2>

          {sent ? (
            <div
              className="p-8 border-l-4 border-green-deep"
              style={{ backgroundColor: '#fff0dc' }}
            >
              <p className="font-serif text-2xl text-green-deep mb-2">
                ¡Gracias por escribirnos!
              </p>
              <p className="text-sm text-gray-600 font-light leading-relaxed mb-6">
                Recibimos tu mensaje y nos pondremos en contacto a la brevedad.
              </p>
              <button
                onClick={() => setSent(false)}
                className="btn-secondary"
              >
                Enviar otro mensaje
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <Field label="Nombre completo">
                  <input
                    name="name"
                    required
                    value={form.name}
                    onChange={handleChange}
                    className={inputCls}
                    placeholder="Tu nombre"
                  />
                </Field>
                <Field label="Email">
                  <input
                    name="email"
                    type="email"
                    required
                    value={form.email}
                    onChange={handleChange}
                    className={inputCls}
                    placeholder="tu@email.com"
                  />
                </Field>
              </div>

              <Field label="Motivo de consulta">
                <select
                  name="subject"
                  required
                  value={form.subject}
                  onChange={handleChange}
                  className={inputCls}
                >
                  <option value="">Seleccioná una opción</option>
                  <option value="pedido">Consulta sobre un pedido</option>
                  <option value="producto">Consulta sobre un producto</option>
                  <option value="envio">Envíos y entregas</option>
                  <option value="mayorista">Compras mayoristas</option>
                  <option value="otro">Otro</option>
                </select>
              </Field>

              <Field label="Mensaje">
                <textarea
                  name="message"
                  required
                  rows={5}
                  value={form.message}
                  onChange={handleChange}
                  className={`${inputCls} resize-none`}
                  placeholder="Contanos en qué podemos ayudarte..."
                />
              </Field>

              <button
                type="submit"
                disabled={loading}
                className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Enviando…' : 'Enviar mensaje'}
              </button>
            </form>
          )}
        </div>

        {/* Info de contacto */}
        <aside className="space-y-8 lg:pt-16">

          {/* Datos directos */}
          <div
            className="p-8"
            style={{ backgroundColor: '#fff0dc' }}
          >
            <p className="text-[10px] tracking-[0.22em] uppercase font-medium mb-6"
               style={{ color: '#18532c' }}>
              Datos de contacto
            </p>
            <div className="space-y-5">
              {CONTACT_INFO.map(item => (
                <div key={item.label}>
                  <p className="text-[10px] tracking-[0.15em] uppercase text-green-olive
                                font-light mb-1">
                    {item.label}
                  </p>
                  <a
                    href={item.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-serif text-lg text-green-deep hover:text-orange
                               transition-colors"
                  >
                    {item.value}
                  </a>
                </div>
              ))}
            </div>
          </div>

          {/* Redes sociales */}
          <div className="p-8 border border-cream-warm">
            <p className="text-[10px] tracking-[0.22em] uppercase font-medium mb-6
                          text-green-olive">
              Seguinos
            </p>
            <div className="flex flex-col gap-3">
              {SOCIAL.map(s => (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 text-sm text-green-deep font-light
                             hover:text-orange transition-colors group"
                >
                  <span
                    className="w-8 h-8 flex items-center justify-center text-xs
                               font-medium transition-colors"
                    style={{ backgroundColor: '#18532c', color: '#fff0dc' }}
                  >
                    {s.label.charAt(0)}
                  </span>
                  {s.label}
                  <span className="ml-auto text-gray-300 group-hover:text-orange">→</span>
                </a>
              ))}
            </div>
          </div>

          {/* Horario */}
          <div className="border-l-2 pl-6" style={{ borderColor: '#ed832b' }}>
            <p className="text-[10px] tracking-[0.15em] uppercase text-green-olive
                          font-light mb-2">
              Horario de atención
            </p>
            <p className="text-sm text-green-deep font-light leading-relaxed">
              Lunes a viernes<br />
              9:00 a 18:00 hs
            </p>
          </div>
        </aside>
      </section>
    </div>
  )
}

const inputCls = `w-full border border-cream-warm bg-white px-4 py-3
                  text-sm text-green-deep font-light
                  focus:outline-none focus:border-orange transition-colors`

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-[11px] tracking-[0.15em] uppercase
                        text-green-olive mb-1.5 font-light">
        {label}
      </label>
      {children}
    </div>
  )
}