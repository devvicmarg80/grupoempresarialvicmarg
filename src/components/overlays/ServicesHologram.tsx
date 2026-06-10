'use client'

import { useState }       from 'react'
import { useRouter }      from 'next/navigation'
import { eventBus }       from '@lib/event-bus'
import { useUserStore }   from '@store/user.store'
import { Materials }      from '@config/design-tokens'
import type { OverlayInstance, ServiceType } from '@types-app'

interface Props {
  overlay:   OverlayInstance
  onDismiss: () => void
}

interface ServiceCard {
  id:    ServiceType
  label: string
  desc:  string
  icon:  string
  href:  string
  color: string
}

const SERVICES: ServiceCard[] = [
  {
    id:    'educativa',
    label: 'Asesoría Educativa',
    desc:  'Formación empresarial, diplomados y certificaciones ejecutivas',
    icon:  '◈',
    href:  '/asesoria-educativa',
    color: 'rgba(96,165,250,',
  },
  {
    id:    'empresarial',
    label: 'Asesoría Empresarial',
    desc:  'Consultoría estratégica y transformación organizacional',
    icon:  '◇',
    href:  '/asesoria-empresarial',
    color: 'rgba(167,139,250,',
  },
]

export function ServicesHologram({ overlay, onDismiss }: Props) {
  const [hoveredId, setHoveredId] = useState<ServiceType | null>(null)
  const router      = useRouter()
  const glass       = Materials.glass.cobalt
  const visitorName = useUserStore((s) => s.visitorName)

  function handleSelect(service: ServiceCard) {
    useUserStore.getState().setSelectedService(service.id)
    eventBus.emit('user:service:selected', { service: service.id })
    onDismiss()
    router.push(service.href)
  }

  return (
    <div
      className="relative rounded-2xl overflow-hidden text-white"
      style={{
        width:               '460px',
        maxWidth:            'calc(100vw - 2rem)',
        background:          glass.background,
        border:              `1px solid ${glass.border}`,
        backdropFilter:      `blur(${glass.blur})`,
        WebkitBackdropFilter:`blur(${glass.blur})`,
      }}
    >
      <div
        className="h-px w-full"
        style={{ background: 'linear-gradient(90deg, transparent, rgba(96,165,250,0.6), transparent)' }}
      />

      <div className="px-7 py-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-5">
          <div>
            <p className="text-[10px] uppercase tracking-[0.16em] text-blue-400/60 font-mono mb-1">
              Servicios VICMARG
            </p>
            <h2
              className="text-xl text-white/90 leading-none"
              style={{ fontFamily: 'var(--font-cinematic)', fontWeight: 300, letterSpacing: '-0.03em' }}
            >
              {visitorName ? `${visitorName}, ¿en qué podemos ayudarte?` : '¿En qué podemos ayudarte?'}
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

        {/* Service cards */}
        <div className="flex flex-col gap-3">
          {SERVICES.map((service) => {
            const isHovered = hoveredId === service.id
            return (
              <button
                key={service.id}
                type="button"
                className="text-left rounded-xl p-5 transition-all duration-300 outline-none"
                style={{
                  background: isHovered
                    ? `${service.color}0.18)`
                    : `${service.color}0.06)`,
                  border:    `1px solid ${isHovered ? `${service.color}0.5)` : `${service.color}0.15)`}`,
                  transform: isHovered ? 'translateY(-2px)' : 'translateY(0)',
                  boxShadow: isHovered ? `0 8px 32px ${service.color}0.2)` : 'none',
                }}
                onMouseEnter={() => { setHoveredId(service.id) }}
                onMouseLeave={() => { setHoveredId(null) }}
                onFocus={()    => { setHoveredId(service.id) }}
                onBlur={()     => { setHoveredId(null) }}
                onClick={()    => { handleSelect(service) }}
              >
                <div className="flex items-center gap-4">
                  <span
                    className="text-2xl transition-all duration-300"
                    style={{ color: isHovered ? `${service.color}1)` : `${service.color}0.4)` }}
                    aria-hidden="true"
                  >
                    {service.icon}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-base font-medium text-white/90 mb-0.5">{service.label}</p>
                    <p className="text-xs text-white/40 leading-snug">{service.desc}</p>
                  </div>
                  <span
                    className="text-white/20 transition-all duration-300 shrink-0"
                    style={{ opacity: isHovered ? 1 : 0, transform: isHovered ? 'translateX(0)' : 'translateX(-4px)' }}
                  >
                    →
                  </span>
                </div>
              </button>
            )
          })}
        </div>

        <p className="mt-5 text-center text-[10px] uppercase tracking-[0.12em] text-white/20 font-mono">
          Selecciona una opción para conocer más
        </p>
      </div>
    </div>
  )
}
