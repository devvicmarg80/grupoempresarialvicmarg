'use client'

import { Materials, Colors } from '@config/design-tokens'
import { eventBus }          from '@lib/event-bus'
import { useSceneStore }     from '@store/scene.store'
import { useUserStore }      from '@store/user.store'
import type { OverlayInstance } from '@types-app'

interface Props {
  overlay:   OverlayInstance
  onDismiss: () => void
}

export function PremiumCTA({ overlay, onDismiss }: Props) {
  const glass = Materials.glass.warm

  const handleConvert = (): void => {
    const scene = useSceneStore.getState().currentScene
    useUserStore.getState().setConverted()
    eventBus.emit('user:converted', { scene, timestamp: Date.now() })
    eventBus.emit('user:journey:advance', { step: 4, scene })
    onDismiss()
  }

  const handleExplore = (): void => {
    const scene = useSceneStore.getState().currentScene
    eventBus.emit('user:journey:advance', { step: 4, scene })
    onDismiss()
  }

  return (
    <div
      className="relative rounded-2xl overflow-hidden text-white"
      style={{
        width:          '420px',
        maxWidth:       'calc(100vw - 2rem)',
        background:     glass.background,
        border:         `1px solid ${glass.border}`,
        backdropFilter: `blur(${glass.blur})`,
        WebkitBackdropFilter: `blur(${glass.blur})`,
      }}
    >
      {/* Gold top accent */}
      <div
        className="h-px w-full"
        style={{ background: `linear-gradient(90deg, transparent, ${Colors.warm.glow}, transparent)` }}
      />

      <div className="px-8 py-7">
        {/* Eyebrow */}
        <p className="text-[10px] uppercase tracking-[0.18em] font-mono mb-4" style={{ color: Colors.warm.light }}>
          Grupo Empresarial VICMARG
        </p>

        {/* Headline */}
        <h2
          className="text-[26px] leading-tight text-white/92 mb-3"
          style={{
            fontFamily:    'var(--font-cinematic)',
            fontWeight:    300,
            letterSpacing: '-0.03em',
          }}
        >
          Conectamos empresas<br />con el futuro
        </h2>

        {/* Value proposition */}
        <p className="text-sm text-white/40 leading-relaxed mb-7">
          Soluciones empresariales de alto impacto. Experiencias únicas,
          resultados extraordinarios. Tu próximo capítulo comienza aquí.
        </p>

        {/* CTAs */}
        <div className="flex flex-col gap-3">
          <button
            type="button"
            onClick={handleConvert}
            className="w-full py-3.5 rounded-xl text-sm font-medium tracking-wide transition-all duration-300"
            style={{
              background:  `rgba(245,158,11,0.25)`,
              border:      `1px solid ${Colors.warm.glow}`,
              color:       Colors.warm.light,
              boxShadow:   `0 0 20px rgba(245,158,11,0.15)`,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background  = 'rgba(245,158,11,0.35)'
              e.currentTarget.style.boxShadow   = '0 0 30px rgba(245,158,11,0.3)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background  = 'rgba(245,158,11,0.25)'
              e.currentTarget.style.boxShadow   = '0 0 20px rgba(245,158,11,0.15)'
            }}
          >
            Solicitar reunión ejecutiva
          </button>

          <button
            type="button"
            onClick={handleExplore}
            className="w-full py-3 rounded-xl text-sm tracking-wide transition-all duration-300 text-white/40 hover:text-white/70"
            style={{
              background: 'rgba(255,255,255,0.03)',
              border:     '1px solid rgba(255,255,255,0.07)',
            }}
          >
            Explorar el portafolio
          </button>
        </div>
      </div>

      {/* Dismiss — only if overlay has it configured */}
      {overlay.dismissible && (
        <button
          type="button"
          onClick={onDismiss}
          className="absolute top-4 right-4 text-white/15 hover:text-white/50 transition-colors text-lg leading-none"
          aria-label="Cerrar"
        >
          ×
        </button>
      )}
    </div>
  )
}
