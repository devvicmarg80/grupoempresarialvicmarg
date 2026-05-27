'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import { eventBus }         from '@lib/event-bus'
import { useUserStore }     from '@store/user.store'
import { Materials }        from '@config/design-tokens'
import type { OverlayInstance } from '@types-app'

interface Props {
  overlay:   OverlayInstance
  onDismiss: () => void
}

type FormState = 'idle' | 'submitting' | 'success'

export function ReceptionistCapture({ overlay, onDismiss }: Props) {
  const [name,      setName]      = useState('')
  const [formState, setFormState] = useState<FormState>('idle')
  const inputRef = useRef<HTMLInputElement>(null)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    // Auto-focus after mount animation settles
    const t = setTimeout(() => inputRef.current?.focus(), 400)
    return () => {
      clearTimeout(t)
      if (timerRef.current !== null) clearTimeout(timerRef.current)
    }
  }, [])

  const handleSubmit = useCallback((e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const trimmed = name.trim()
    if (!trimmed || formState !== 'idle') return

    setFormState('submitting')

    // Artificial brief delay for perceived AI processing
    timerRef.current = setTimeout(() => {
      useUserStore.getState().setVisitorName(trimmed)
      eventBus.emit('user:name:captured', { name: trimmed })
      setFormState('success')

      timerRef.current = setTimeout(onDismiss, 1600)
    }, 600)
  }, [name, formState, onDismiss])

  const glass = Materials.glass.dark

  return (
    <div
      className="relative rounded-2xl overflow-hidden text-white select-none"
      style={{
        width:          '360px',
        maxWidth:       'calc(100vw - 2rem)',
        background:     glass.background,
        border:         `1px solid ${glass.border}`,
        backdropFilter: `blur(${glass.blur})`,
        WebkitBackdropFilter: `blur(${glass.blur})`,
      }}
    >
      {/* Top accent bar */}
      <div
        className="h-px w-full"
        style={{ background: 'linear-gradient(90deg, transparent, rgba(96,165,250,0.5), transparent)' }}
      />

      <div className="px-8 py-7">
        {/* Icon */}
        <div className="flex items-center gap-3 mb-5">
          <div
            className="w-9 h-9 rounded-full flex items-center justify-center shrink-0"
            style={{ background: 'rgba(37,99,235,0.25)', border: '1px solid rgba(96,165,250,0.3)' }}
          >
            <span className="text-blue-400 text-sm font-mono">AI</span>
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-[0.14em] text-white/30 font-mono">VICMARG Receptionist</p>
            <p className="text-xs text-white/50">Sistema de bienvenida activo</p>
          </div>
        </div>

        {formState === 'success' ? (
          /* Success state */
          <div className="py-4 text-center">
            <p className="text-2xl mb-2" style={{ fontFamily: 'var(--font-cinematic)', fontWeight: 300 }}>
              Bienvenido, {useUserStore.getState().visitorName}
            </p>
            <p className="text-sm text-white/40 tracking-wide">Preparando tu experiencia…</p>
          </div>
        ) : (
          /* Form state */
          <form onSubmit={handleSubmit}>
            <p
              className="text-[22px] leading-snug mb-1 text-white/90"
              style={{ fontFamily: 'var(--font-cinematic)', fontWeight: 300, letterSpacing: '-0.02em' }}
            >
              ¿Cómo debemos llamarte?
            </p>
            <p className="text-sm text-white/35 mb-6 tracking-wide">
              Para personalizar tu visita al grupo empresarial
            </p>

            {/* Input */}
            <div className="relative mb-6">
              <input
                ref={inputRef}
                type="text"
                value={name}
                onChange={(e) => { setName(e.target.value) }}
                placeholder="Tu nombre…"
                maxLength={48}
                autoComplete="given-name"
                className="w-full bg-transparent text-white placeholder-white/20 text-base pb-2 outline-none border-b transition-colors duration-300"
                style={{ borderColor: name ? 'rgba(96,165,250,0.6)' : 'rgba(255,255,255,0.12)' }}
                disabled={formState === 'submitting'}
              />
            </div>

            {/* CTA */}
            <button
              type="submit"
              disabled={!name.trim() || formState === 'submitting'}
              className="w-full py-3 rounded-xl text-sm font-medium tracking-wide transition-all duration-300 disabled:opacity-30 disabled:cursor-not-allowed"
              style={{
                background:   name.trim() ? 'rgba(37,99,235,0.8)' : 'rgba(37,99,235,0.2)',
                border:       '1px solid rgba(96,165,250,0.3)',
                color:        '#e2e8f0',
                backdropFilter: 'blur(8px)',
              }}
            >
              {formState === 'submitting' ? 'Un momento…' : 'Comenzar experiencia'}
            </button>
          </form>
        )}
      </div>

      {/* Dismiss (small × in corner) */}
      {overlay.dismissible && formState === 'idle' && (
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
