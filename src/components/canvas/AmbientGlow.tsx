'use client'

// AmbientGlow — light effects that appear when the user is idle (no scroll for 3s).
// z-16: above AtmosphericCanvas (z-11), below particles (z-19) and overlays.
// Pure CSS animations: breathing glow + slow scanning light ray.

import { useEffect, useState } from 'react'
import { useSceneStore, selectCurrentScene } from '@store/scene.store'
import type { SceneId } from '@types-app'

const GLOW_CONFIG: Record<SceneId, { center: string; edge: string; ray: string }> = {
  ARRIVAL: {
    center: 'rgba(30,58,138,0.22)',
    edge:   'rgba(59,130,246,0.10)',
    ray:    'rgba(96,165,250,0.06)',
  },
  GREETING: {
    center: 'rgba(29,64,175,0.20)',
    edge:   'rgba(100,180,255,0.09)',
    ray:    'rgba(120,200,255,0.05)',
  },
  DISCOVERY: {
    center: 'rgba(29,78,216,0.28)',
    edge:   'rgba(59,130,246,0.14)',
    ray:    'rgba(96,165,250,0.08)',
  },
  CONVERSION: {
    center: 'rgba(180,100,20,0.22)',
    edge:   'rgba(245,158,11,0.10)',
    ray:    'rgba(252,211,77,0.06)',
  },
}

export function AmbientGlow() {
  const [idle, setIdle] = useState(false)
  const currentScene    = useSceneStore(selectCurrentScene)
  const cfg             = GLOW_CONFIG[currentScene]

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>

    const wake = () => {
      setIdle(false)
      clearTimeout(timer)
      timer = setTimeout(() => setIdle(true), 3500)
    }

    window.addEventListener('scroll', wake, { passive: true })
    window.addEventListener('mousemove', wake, { passive: true })
    timer = setTimeout(() => setIdle(true), 3500)

    return () => {
      clearTimeout(timer)
      window.removeEventListener('scroll', wake)
      window.removeEventListener('mousemove', wake)
    }
  }, [])

  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: 16 }}
    >
      {/* Breathing central glow */}
      <div
        style={{
          position:   'absolute',
          inset:      0,
          background: `radial-gradient(ellipse 70% 55% at 50% 65%, ${cfg.center} 0%, ${cfg.edge} 45%, transparent 72%)`,
          opacity:    idle ? 1 : 0,
          transition: 'opacity 2.5s ease',
          animation:  idle ? 'vicmarg-glow-breathe 5s ease-in-out infinite' : 'none',
        }}
      />

      {/* Corner accent — top right */}
      <div
        style={{
          position:   'absolute',
          top:        '-10%',
          right:      '-5%',
          width:      '40%',
          height:     '55%',
          background: `radial-gradient(ellipse at 80% 20%, ${cfg.edge} 0%, transparent 65%)`,
          opacity:    idle ? 0.7 : 0,
          transition: 'opacity 3s ease',
          animation:  idle ? 'vicmarg-glow-breathe 7s ease-in-out infinite reverse' : 'none',
        }}
      />

      {/* Scanning light ray */}
      <div
        style={{
          position:   'absolute',
          left:       '-10%',
          right:      '-10%',
          height:     '2px',
          background: `linear-gradient(90deg, transparent 0%, ${cfg.ray} 30%, transparent 60%, ${cfg.ray} 90%, transparent 100%)`,
          opacity:    idle ? 0.8 : 0,
          transition: 'opacity 2s ease',
          animation:  idle ? 'vicmarg-scan-line 12s linear infinite' : 'none',
          top:        '30%',
          filter:     'blur(1px)',
        }}
      />

      {/* Lens flare dot — top left */}
      <div
        style={{
          position:     'absolute',
          top:          '12%',
          left:         '8%',
          width:        '6px',
          height:       '6px',
          borderRadius: '50%',
          background:   cfg.edge,
          boxShadow:    `0 0 20px 8px ${cfg.edge}, 0 0 40px 16px ${cfg.center}`,
          opacity:      idle ? 0.6 : 0,
          transition:   'opacity 2s ease 0.5s',
          animation:    idle ? 'vicmarg-glow-breathe 6s ease-in-out infinite 1s' : 'none',
        }}
      />
    </div>
  )
}
