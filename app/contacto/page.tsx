'use client'

import { useState } from 'react'

export default function ContactoPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [subject, setSubject] = useState('')
  const [message, setMessage] = useState('')
  const [sent, setSent] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [sending, setSending] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim() || !email.trim() || !message.trim()) return

    setSending(true)
    setError(null)

    try {
      // Por ahora simula el envío — más adelante puedes conectar un servicio de email
      await new Promise((resolve) => setTimeout(resolve, 1000))
      setSent(true)
    } catch {
      setError('Error al enviar el mensaje. Intenta de nuevo.')
    } finally {
      setSending(false)
    }
  }

  if (sent) {
    return (
      <div className="max-w-lg mx-auto px-4 py-24 text-center">
        <div className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-5">
          <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h1 className="text-2xl font-semibold mb-2">¡Mensaje enviado!</h1>
        <p className="text-sm text-muted mb-6">Gracias por contactarnos. Te responderemos lo antes posible.</p>
        <a href="/" className="inline-block px-6 py-2.5 text-sm font-medium text-white bg-brand hover:bg-brand-hover rounded-full transition-colors">
          Volver al inicio
        </a>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <div className="grid grid-cols-1 md:grid-cols-[1fr_280px] gap-10">

        {/* Formulario */}
        <div>
          <h1 className="text-3xl font-semibold mb-2">Contacto</h1>
          <p className="text-sm text-muted mb-8">¿Tienes dudas, sugerencias o quieres colaborar? Escríbenos.</p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div>
              <label className="block text-sm font-medium text-[#111] mb-1.5">Nombre *</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Tu nombre"
                required
                className="w-full px-4 py-2.5 text-sm bg-[#f7f7f7] border border-border rounded-xl outline-none focus:border-brand focus:bg-white transition-colors placeholder:text-[#a0a0a0]"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#111] mb-1.5">Email *</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@email.com"
                required
                className="w-full px-4 py-2.5 text-sm bg-[#f7f7f7] border border-border rounded-xl outline-none focus:border-brand focus:bg-white transition-colors placeholder:text-[#a0a0a0]"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#111] mb-1.5">Asunto</label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="¿De qué se trata?"
                className="w-full px-4 py-2.5 text-sm bg-[#f7f7f7] border border-border rounded-xl outline-none focus:border-brand focus:bg-white transition-colors placeholder:text-[#a0a0a0]"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#111] mb-1.5">Mensaje *</label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Cuéntanos en qué podemos ayudarte..."
                rows={5}
                required
                className="w-full px-4 py-2.5 text-sm bg-[#f7f7f7] border border-border rounded-xl outline-none focus:border-brand focus:bg-white transition-colors placeholder:text-[#a0a0a0] resize-none"
              />
            </div>

            {error && (
              <div className="px-3 py-2 bg-red-50 border border-red-100 rounded-lg text-xs text-red-600">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={sending}
              className="self-start px-8 py-2.5 text-sm font-medium text-white bg-brand hover:bg-brand-hover disabled:opacity-60 rounded-full transition-colors"
            >
              {sending ? 'Enviando...' : 'Enviar mensaje'}
            </button>
          </form>
        </div>

        {/* Sidebar info */}
        <div className="md:pt-14">
          <div className="rounded-[12px] border border-border p-5">
            <h3 className="text-sm font-semibold mb-4 text-muted uppercase tracking-wide">Info</h3>

            <div className="flex flex-col gap-4">
              <div className="flex items-start gap-3">
                <svg className="w-5 h-5 text-brand shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <div>
                  <p className="text-sm font-medium text-[#111]">Email</p>
                  <p className="text-sm text-muted">contacto@tuchefsoy.com</p>
                </div>
              </div>

              <div className="border-t border-border pt-4 flex items-start gap-3">
                <svg className="w-5 h-5 text-brand shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <div>
                  <p className="text-sm font-medium text-[#111]">Ubicación</p>
                  <p className="text-sm text-muted">León, Guanajuato, México</p>
                </div>
              </div>

              <div className="border-t border-border pt-4 flex items-start gap-3">
                <svg className="w-5 h-5 text-brand shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <p className="text-sm font-medium text-[#111]">Respuesta</p>
                  <p className="text-sm text-muted">1-2 días hábiles</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}