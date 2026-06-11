'use client'

// SceneCounter — "01 / 04" HUD in top-right corner.
// Transitions with a number flip animation between scenes.
// z-28: same level as narrative text.

import { useEffect, useRef, useState } from 'react'
import { useSceneStore }               from '@store/scene.store'
import { gsap }                        from 'gsap'
import type { SceneId }                from '@types-app'

const SCENE_NUMBERS: Record<SceneId, string> = {
  ARRIVAL:    '01',
  GREETING:   '02',
  DISCOVERY:  '03',
  CONVERSION: '04',
}

const SCENE_LABELS: Record<SceneId, string> = {
  ARRIVAL:    'Llegada',
  GREETING:   'Bienvenida',
  DISCOVERY:  'Descubrimiento',
  CONVERSION: 'Decisión',
}

export function SceneCounter() {
  const currentScene = useSceneStore((s) => s.currentScene)
  const isConversion = currentScene === 'CONVERSION'
  const numRef       = useRef<HTMLSpanElement>(null)
  const labelRef     = useRef<HTMLSpanElement>(null)
  const prevScene    = useRef<SceneId | null>(null)

  // Flip number on scene change
  useEffect(() => {
    if (prevScene.current === currentScene) return
    prevScene.current = currentScene

    const num   = numRef.current
    const label = labelRef.current
    if (!num || !label) return

    gsap.fromTo(
      [num, label],
      { opacity: 0, y: -8 },
      { opacity: 1, y: 0, duration: 0.55, ease: 'power3.out', stagger: 0.05 },
    )
  }, [currentScene])

  const accent = isConversion ? 'rgba(245,158,11,0.85)' : 'rgba(148,163,184,0.60)'

  return (
    <div
      className="fixed pointer-events-none select-none"
      style={{
        zIndex: 28,
        right:  'clamp(20px, 3.5vw, 48px)',
        top:    'clamp(20px, 3.5vh, 36px)',
      }}
    >
      <div className="flex flex-col items-end gap-0.5">
        <div className="flex items-baseline gap-1.5">
          <span
            ref={numRef}
            style={{
              fontFamily:    'var(--font-mono)',
              fontSize:      'clamp(18px, 2vw, 24px)',
              fontWeight:    400,
              color:         isConversion ? '#f59e0b' : 'rgba(255,255,255,0.85)',
              letterSpacing: '-0.02em',
              lineHeight:    1,
            }}
          >
            {SCENE_NUMBERS[currentScene]}
          </span>
          <span
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize:   '10px',
              color:      'rgba(255,255,255,0.25)',
            }}
          >
            / 04
          </span>
        </div>
        <span
          ref={labelRef}
          style={{
            fontFamily:    'var(--font-mono)',
            fontSize:      '8px',
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
            color:         accent,
          }}
        >
          {SCENE_LABELS[currentScene]}
        </span>
      </div>
    </div>
  )
}
