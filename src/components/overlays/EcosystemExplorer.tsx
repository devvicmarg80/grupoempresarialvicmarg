'use client'

import { Materials }    from '@config/design-tokens'
import { eventBus }     from '@lib/event-bus'
import { useSceneStore } from '@store/scene.store'
import type { OverlayInstance } from '@types-app'

interface Props {
  overlay:   OverlayInstance
  onDismiss: () => void
}

const METRICS = [
  { value: '15+',  label: 'Años de\nexperiencia' },
  { value: '200+', label: 'Proyectos\nexitosos' },
  { value: '4',    label: 'Unidades de\nnegocio' },
] as const

export function EcosystemExplorer({ overlay, onDismiss }: Props) {
  const glass = Materials.glass.cobalt

  const handleCTA = (): void => {
    const scene = useSceneStore.getState().currentScene
    eventBus.emit('user:journey:advance', { step: 3, scene })
    onDismiss()
  }

  return (
    <div
      className="relative rounded-2xl overflow-hidden text-white"
      style={{
        width:          '440px',
        maxWidth:       'calc(100vw - 2rem)',
        background:     glass.background,
        border:         `1px solid ${glass.border}`,
        backdropFilter: `blur(${glass.blur})`,
        WebkitBackdropFilter: `blur(${glass.blur})`,
      }}
    >
      {/* Top accent */}
      <div
        className="h-px w-full"
        style={{ background: 'linear-gradient(90deg, transparent, rgba(96,165,250,0.5), transparent)' }}
      />

      <div className="px-7 py-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-5">
          <div>
            <p className="text-[10px] uppercase tracking-[0.16em] text-blue-400/50 font-mono mb-1">
              Grupo Empresarial
            </p>
            <h2
              className="text-xl text-white/90"
              style={{ fontFamily: 'var(--font-cinematic)', fontWeight: 300, letterSpacing: '-0.03em' }}
            >
              El Ecosistema VICMARG
            </h2>
          </div>
          {overlay.dismissible && (
            <button
              type="button"
              onClick={onDismiss}
              className="text-white/20 hover:text-white/60 transition-colors text-lg leading-none mt-0.5"
              aria-label="Cerrar"
            >
              ×
            </button>
          )}
        </div>

        {/* Description */}
        <p className="text-sm text-white/40 leading-relaxed mb-6">
          Un conglomerado empresarial integrado que combina experiencia,
          innovación y compromiso para transformar sectores clave de la economía.
        </p>

        {/* Metrics */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          {METRICS.map((metric) => (
            <div
              key={metric.value}
              className="rounded-xl py-4 px-3 text-center"
              style={{
                background: 'rgba(37,99,235,0.08)',
                border:     '1px solid rgba(96,165,250,0.10)',
              }}
            >
              <p
                className="text-2xl text-blue-300/80 leading-none mb-1"
                style={{ fontFamily: 'var(--font-cinematic)', fontWeight: 300 }}
              >
                {metric.value}
              </p>
              <p className="text-[10px] text-white/30 leading-snug whitespace-pre-line font-mono">
                {metric.label}
              </p>
            </div>
          ))}
        </div>

        {/* CTA */}
        <button
          type="button"
          onClick={handleCTA}
          className="w-full py-3 rounded-xl text-sm tracking-wide transition-all duration-300 text-white/70 hover:text-white/90"
          style={{
            background: 'rgba(37,99,235,0.12)',
            border:     '1px solid rgba(96,165,250,0.20)',
          }}
        >
          Ver el ecosistema completo
        </button>
      </div>
    </div>
  )
}
