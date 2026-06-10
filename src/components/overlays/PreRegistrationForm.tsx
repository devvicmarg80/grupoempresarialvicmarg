'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import { eventBus }      from '@lib/event-bus'
import { useUserStore }  from '@store/user.store'
import { Materials }     from '@config/design-tokens'
import type { OverlayInstance } from '@types-app'

interface Props {
  overlay:   OverlayInstance
  onDismiss: () => void
}

type FormState = 'idle' | 'submitting' | 'success' | 'error'

interface FormData {
  name:    string
  email:   string
  phone:   string
  message: string
}

// Update with actual VICMARG WhatsApp number
const WHATSAPP_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? '573000000000'

export function PreRegistrationForm({ overlay, onDismiss }: Props) {
  const visitorName = useUserStore((s) => s.visitorName)
  const [formState, setFormState] = useState<FormState>('idle')
  const [data, setData] = useState<FormData>({
    name:    visitorName ?? '',
    email:   '',
    phone:   '',
    message: '',
  })
  const nameRef = useRef<HTMLInputElement>(null)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    const t = setTimeout(() => {
      if (!data.name) nameRef.current?.focus()
    }, 400)
    return () => {
      clearTimeout(t)
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [data.name])

  const set = useCallback((field: keyof FormData, value: string) => {
    setData((prev) => ({ ...prev, [field]: value }))
  }, [])

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()
    if (formState !== 'idle') return
    const { name, email, phone } = data
    if (!name.trim() || !email.trim() || !phone.trim()) return

    setFormState('submitting')

    try {
      await fetch('/api/lead/register', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ ...data, source: 'vicmarg-funnel' }),
      })

      useUserStore.getState().setRegistrationSubmitted()
      eventBus.emit('user:registration:submitted', {
        name:  data.name.trim(),
        email: data.email.trim(),
        phone: data.phone.trim(),
      })
      setFormState('success')
    } catch {
      setFormState('error')
    }
  }, [data, formState])

  function handleWhatsApp() {
    const msg = encodeURIComponent(
      `Hola VICMARG, soy ${data.name || 'un visitante'} y me interesa conocer más sobre sus servicios.`
    )
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${msg}`, '_blank')
  }

  const glass = Materials.glass.dark
  const isValid = data.name.trim() && data.email.trim() && data.phone.trim()

  return (
    <div
      className="relative rounded-2xl overflow-hidden text-white select-none"
      style={{
        width:               '420px',
        maxWidth:            'calc(100vw - 2rem)',
        background:          glass.background,
        border:              `1px solid ${glass.border}`,
        backdropFilter:      `blur(${glass.blur})`,
        WebkitBackdropFilter:`blur(${glass.blur})`,
      }}
    >
      <div
        className="h-px w-full"
        style={{ background: 'linear-gradient(90deg, transparent, rgba(96,165,250,0.5), transparent)' }}
      />

      <div className="px-8 py-7">
        {/* Header */}
        <div className="mb-5">
          <p className="text-[10px] uppercase tracking-[0.16em] text-blue-400/60 font-mono mb-1">
            Pre-inscripción VICMARG
          </p>
          <h2
            className="text-xl text-white/90 leading-tight"
            style={{ fontFamily: 'var(--font-cinematic)', fontWeight: 300, letterSpacing: '-0.02em' }}
          >
            {formState === 'success'
              ? `Bienvenido/a al ecosistema${data.name ? `, ${data.name}` : ''}`
              : 'Únete al ecosistema VICMARG'}
          </h2>
        </div>

        {formState === 'success' ? (
          /* ─── Success State ──────────────────────────────────────────── */
          <div className="py-2">
            <div
              className="rounded-xl p-4 mb-5"
              style={{ background: 'rgba(37,99,235,0.12)', border: '1px solid rgba(96,165,250,0.2)' }}
            >
              <p className="text-sm text-white/70 leading-relaxed">
                Tu información fue recibida. Un asesor VICMARG te contactará pronto.
              </p>
            </div>

            <button
              type="button"
              onClick={handleWhatsApp}
              className="w-full py-3 rounded-xl text-sm font-medium tracking-wide transition-all duration-300 mb-3"
              style={{
                background:   'rgba(37,213,95,0.15)',
                border:       '1px solid rgba(37,213,95,0.3)',
                color:        'rgba(134,239,172,0.9)',
              }}
            >
              Continuar por WhatsApp →
            </button>

            <button
              type="button"
              onClick={onDismiss}
              className="w-full py-2.5 rounded-xl text-xs text-white/30 hover:text-white/60 transition-colors"
            >
              Cerrar y continuar explorando
            </button>
          </div>
        ) : (
          /* ─── Form State ─────────────────────────────────────────────── */
          <form onSubmit={handleSubmit} noValidate>
            <div className="flex flex-col gap-4 mb-5">
              {/* Name */}
              <div>
                <label className="block text-[10px] uppercase tracking-[0.12em] text-white/30 font-mono mb-1.5">
                  Nombre completo *
                </label>
                <input
                  ref={nameRef}
                  type="text"
                  value={data.name}
                  onChange={(e) => { set('name', e.target.value) }}
                  placeholder="Tu nombre…"
                  maxLength={60}
                  autoComplete="name"
                  disabled={formState === 'submitting'}
                  className="w-full bg-transparent text-white placeholder-white/20 text-sm pb-2 outline-none border-b transition-colors duration-300"
                  style={{ borderColor: data.name ? 'rgba(96,165,250,0.5)' : 'rgba(255,255,255,0.1)' }}
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-[10px] uppercase tracking-[0.12em] text-white/30 font-mono mb-1.5">
                  Correo electrónico *
                </label>
                <input
                  type="email"
                  value={data.email}
                  onChange={(e) => { set('email', e.target.value) }}
                  placeholder="tu@email.com"
                  autoComplete="email"
                  disabled={formState === 'submitting'}
                  className="w-full bg-transparent text-white placeholder-white/20 text-sm pb-2 outline-none border-b transition-colors duration-300"
                  style={{ borderColor: data.email ? 'rgba(96,165,250,0.5)' : 'rgba(255,255,255,0.1)' }}
                />
              </div>

              {/* Phone */}
              <div>
                <label className="block text-[10px] uppercase tracking-[0.12em] text-white/30 font-mono mb-1.5">
                  Teléfono / WhatsApp *
                </label>
                <input
                  type="tel"
                  value={data.phone}
                  onChange={(e) => { set('phone', e.target.value) }}
                  placeholder="+57 300 000 0000"
                  autoComplete="tel"
                  disabled={formState === 'submitting'}
                  className="w-full bg-transparent text-white placeholder-white/20 text-sm pb-2 outline-none border-b transition-colors duration-300"
                  style={{ borderColor: data.phone ? 'rgba(96,165,250,0.5)' : 'rgba(255,255,255,0.1)' }}
                />
              </div>

              {/* Message (optional) */}
              <div>
                <label className="block text-[10px] uppercase tracking-[0.12em] text-white/30 font-mono mb-1.5">
                  Mensaje (opcional)
                </label>
                <textarea
                  value={data.message}
                  onChange={(e) => { set('message', e.target.value) }}
                  placeholder="¿En qué área te interesa crecer?"
                  rows={2}
                  maxLength={300}
                  disabled={formState === 'submitting'}
                  className="w-full bg-transparent text-white placeholder-white/20 text-sm outline-none border-b resize-none transition-colors duration-300"
                  style={{ borderColor: data.message ? 'rgba(96,165,250,0.3)' : 'rgba(255,255,255,0.08)' }}
                />
              </div>
            </div>

            {formState === 'error' && (
              <p className="text-xs text-red-400/80 mb-4">
                Ocurrió un error. Intenta de nuevo o contáctanos por WhatsApp.
              </p>
            )}

            <button
              type="submit"
              disabled={!isValid || formState === 'submitting'}
              className="w-full py-3 rounded-xl text-sm font-medium tracking-wide transition-all duration-300 mb-3 disabled:opacity-30 disabled:cursor-not-allowed"
              style={{
                background:   isValid ? 'rgba(37,99,235,0.8)' : 'rgba(37,99,235,0.2)',
                border:       '1px solid rgba(96,165,250,0.3)',
                color:        '#e2e8f0',
              }}
            >
              {formState === 'submitting' ? 'Enviando…' : 'Solicitar información'}
            </button>

            <button
              type="button"
              onClick={handleWhatsApp}
              className="w-full py-2.5 rounded-xl text-xs tracking-wide transition-all duration-300"
              style={{
                background: 'rgba(37,213,95,0.08)',
                border:     '1px solid rgba(37,213,95,0.2)',
                color:      'rgba(134,239,172,0.7)',
              }}
            >
              O escríbenos directamente por WhatsApp
            </button>
          </form>
        )}
      </div>

      {overlay.dismissible && formState !== 'submitting' && (
        <button
          type="button"
          onClick={onDismiss}
          className="absolute top-4 right-4 text-white/20 hover:text-white/60 transition-colors text-lg leading-none"
          aria-label="Cerrar"
        >
          ×
        </button>
      )}
    </div>
  )
}
