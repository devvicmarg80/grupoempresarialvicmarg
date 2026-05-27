'use client'

import { useState }     from 'react'
import { Materials }    from '@config/design-tokens'
import type { OverlayInstance } from '@types-app'

interface Props {
  overlay:   OverlayInstance
  onDismiss: () => void
}

interface ServiceCard {
  id:    string
  label: string
  desc:  string
  icon:  string
}

const SERVICES: ServiceCard[] = [
  { id: 'constructora', label: 'Constructora',  desc: 'Ingeniería y construcción civil',       icon: '◈' },
  { id: 'inmobiliaria', label: 'Inmobiliaria',  desc: 'Desarrollo de activos inmobiliarios',    icon: '◇' },
  { id: 'industrial',   label: 'Industrial',    desc: 'Servicios industriales especializados',  icon: '◉' },
  { id: 'inversiones',  label: 'Inversiones',   desc: 'Portafolio estratégico de capital',      icon: '◎' },
]

export function ServicesHologram({ overlay, onDismiss }: Props) {
  const [hoveredId, setHoveredId] = useState<string | null>(null)
  const glass = Materials.glass.cobalt

  return (
    <div
      className="relative rounded-2xl overflow-hidden text-white"
      style={{
        width:          '480px',
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
        style={{ background: 'linear-gradient(90deg, transparent, rgba(96,165,250,0.6), transparent)' }}
      />

      <div className="px-7 py-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-5">
          <div>
            <p className="text-[10px] uppercase tracking-[0.16em] text-blue-400/60 font-mono mb-1">
              Ecosistema VICMARG
            </p>
            <h2
              className="text-xl text-white/90 leading-none"
              style={{ fontFamily: 'var(--font-cinematic)', fontWeight: 300, letterSpacing: '-0.03em' }}
            >
              Nuestras Unidades de Negocio
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

        {/* Services grid */}
        <div className="grid grid-cols-2 gap-3">
          {SERVICES.map((service) => {
            const isHovered = hoveredId === service.id
            return (
              <button
                key={service.id}
                type="button"
                className="text-left rounded-xl p-4 transition-all duration-300 outline-none"
                style={{
                  background: isHovered ? 'rgba(37,99,235,0.2)' : 'rgba(37,99,235,0.06)',
                  border:     `1px solid ${isHovered ? 'rgba(96,165,250,0.4)' : 'rgba(96,165,250,0.12)'}`,
                  transform:  isHovered ? 'translateY(-1px)' : 'translateY(0)',
                  boxShadow:  isHovered ? '0 4px 20px rgba(37,99,235,0.25)' : 'none',
                }}
                onMouseEnter={() => { setHoveredId(service.id) }}
                onMouseLeave={() => { setHoveredId(null) }}
                onFocus={()   => { setHoveredId(service.id) }}
                onBlur={()    => { setHoveredId(null) }}
              >
                <span
                  className="block text-xl mb-2 transition-colors duration-300"
                  style={{ color: isHovered ? 'rgba(96,165,250,0.9)' : 'rgba(96,165,250,0.4)' }}
                  aria-hidden="true"
                >
                  {service.icon}
                </span>
                <p className="text-sm font-medium text-white/80 mb-0.5">{service.label}</p>
                <p className="text-[11px] text-white/30 leading-snug">{service.desc}</p>
              </button>
            )
          })}
        </div>

        {/* Footer hint */}
        <p className="mt-5 text-center text-[10px] uppercase tracking-[0.12em] text-white/20 font-mono">
          Selecciona una unidad para explorar
        </p>
      </div>
    </div>
  )
}
