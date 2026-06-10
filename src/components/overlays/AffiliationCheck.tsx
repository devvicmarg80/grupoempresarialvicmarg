'use client'

import { useState }      from 'react'
import { eventBus }      from '@lib/event-bus'
import { useUserStore }  from '@store/user.store'
import { Materials }     from '@config/design-tokens'
import type { OverlayInstance } from '@types-app'

interface Props {
  overlay:   OverlayInstance
  onDismiss: () => void
}

export function AffiliationCheck({ overlay, onDismiss }: Props) {
  const visitorName = useUserStore((s) => s.visitorName)
  const [selecting, setSelecting] = useState(false)

  const glass = Materials.glass.dark

  function handleAnswer(isAffiliated: boolean) {
    if (selecting) return
    setSelecting(true)
    useUserStore.getState().setAffiliation(isAffiliated)
    eventBus.emit('user:affiliation:answered', { isAffiliated })
    onDismiss()
  }

  return (
    <div
      className="relative rounded-2xl overflow-hidden text-white select-none"
      style={{
        width:               '400px',
        maxWidth:            'calc(100vw - 2rem)',
        background:          glass.background,
        border:              `1px solid ${glass.border}`,
        backdropFilter:      `blur(${glass.blur})`,
        WebkitBackdropFilter:`blur(${glass.blur})`,
      }}
    >
      {/* Top accent */}
      <div
        className="h-px w-full"
        style={{ background: 'linear-gradient(90deg, transparent, rgba(96,165,250,0.5), transparent)' }}
      />

      <div className="px-8 py-7">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div
            className="w-9 h-9 rounded-full flex items-center justify-center shrink-0"
            style={{ background: 'rgba(37,99,235,0.25)', border: '1px solid rgba(96,165,250,0.3)' }}
          >
            <span className="text-blue-400 text-xs font-mono">VM</span>
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-[0.14em] text-white/30 font-mono">VICMARG</p>
            <p className="text-xs text-white/50">Sistema de acceso</p>
          </div>
        </div>

        {/* Question */}
        <p
          className="text-[21px] leading-snug mb-2 text-white/90"
          style={{ fontFamily: 'var(--font-cinematic)', fontWeight: 300, letterSpacing: '-0.02em' }}
        >
          {visitorName ? `${visitorName}, ¿` : '¿'}
          ya eres parte de VICMARG?
        </p>
        <p className="text-sm text-white/35 mb-7 tracking-wide">
          Esto nos permite personalizar tu experiencia
        </p>

        {/* Options */}
        <div className="flex flex-col gap-3">
          <button
            type="button"
            onClick={() => { handleAnswer(true) }}
            disabled={selecting}
            className="w-full py-3.5 rounded-xl text-sm font-medium tracking-wide transition-all duration-300 disabled:opacity-40"
            style={{
              background:   'rgba(37,99,235,0.75)',
              border:       '1px solid rgba(96,165,250,0.4)',
              color:        '#e2e8f0',
              backdropFilter: 'blur(8px)',
            }}
          >
            Sí, soy afiliado/a
          </button>

          <button
            type="button"
            onClick={() => { handleAnswer(false) }}
            disabled={selecting}
            className="w-full py-3.5 rounded-xl text-sm font-medium tracking-wide transition-all duration-300 disabled:opacity-40"
            style={{
              background:   'rgba(255,255,255,0.04)',
              border:       '1px solid rgba(255,255,255,0.1)',
              color:        'rgba(255,255,255,0.65)',
            }}
          >
            No, quiero registrarme
          </button>
        </div>
      </div>

      {overlay.dismissible && (
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
