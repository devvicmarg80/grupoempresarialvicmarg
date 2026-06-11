'use client'

// SceneNarrative — the biggest storytelling gap identified in the audit.
// Each scene gets a floating text card that reveals from bottom with GSAP,
// holds for the mid-section of the scene, then fades before transition.
// Position: bottom-left, above footer (z-28).
// Follows the scene progress from eventBus, NOT time-based.

import { useEffect, useRef } from 'react'
import { useSceneStore }     from '@store/scene.store'
import { gsap }              from 'gsap'
import type { SceneId }      from '@types-app'

interface Narrative {
  eyebrow:  string
  headline: string
  body:     string
  accent?:  string  // hex color for eyebrow + left border
}

const NARRATIVES: Record<SceneId, Narrative> = {
  ARRIVAL: {
    eyebrow:  '/ Asesoría Estratégica',
    headline: 'Transformamos organizaciones',
    body:     'Con visión, método y resultados medibles en cada proyecto.',
    accent:   '#60a5fa',
  },
  GREETING: {
    eyebrow:  '/ Ecosistema VICMARG',
    headline: 'Aliados de alto impacto',
    body:     'Educativa · Empresarial · Tecnológica — un ecosistema completo.',
    accent:   '#7dd3fc',
  },
  DISCOVERY: {
    eyebrow:  '/ Metodología',
    headline: 'Soluciones de clase mundial',
    body:     'Desde el diagnóstico estratégico hasta la ejecución de alto rendimiento.',
    accent:   '#3b82f6',
  },
  CONVERSION: {
    eyebrow:  '/ Su próximo paso',
    headline: 'El futuro comienza aquí',
    body:     'Únase a los líderes que ya transformaron su organización con VICMARG.',
    accent:   '#f59e0b',
  },
}

// What fraction of scene progress triggers show vs. hide
const SHOW_AT  = 0.08   // reveal when scene is 8% in
const HIDE_AT  = 0.85   // fade out at 85% (before next scene)

export function SceneNarrative() {
  const currentScene   = useSceneStore((s) => s.currentScene)
  const sceneProgress  = useSceneStore((s) => s.sceneProgress)
  const containerRef   = useRef<HTMLDivElement>(null)
  const prevScene      = useRef<SceneId | null>(null)
  const isVisible      = useRef(false)

  // When scene changes, instantly hide and prep for new reveal
  useEffect(() => {
    if (prevScene.current === currentScene) return
    prevScene.current = currentScene
    isVisible.current = false

    if (!containerRef.current) return
    gsap.killTweensOf(containerRef.current)
    gsap.set(containerRef.current, {
      opacity: 0,
      y:       20,
      filter:  'blur(4px)',
    })
  }, [currentScene])

  // Reveal / hide based on scene progress
  useEffect(() => {
    const el = containerRef.current
    if (!el) return

    if (sceneProgress >= SHOW_AT && sceneProgress < HIDE_AT && !isVisible.current) {
      isVisible.current = true
      gsap.killTweensOf(el)
      gsap.to(el, {
        opacity:  1,
        y:        0,
        filter:   'blur(0px)',
        duration: 0.9,
        ease:     'power3.out',
      })
    } else if ((sceneProgress < SHOW_AT || sceneProgress >= HIDE_AT) && isVisible.current) {
      isVisible.current = false
      gsap.killTweensOf(el)
      gsap.to(el, {
        opacity:  0,
        y:        sceneProgress >= HIDE_AT ? -12 : 12,
        filter:   'blur(3px)',
        duration: 0.55,
        ease:     'power2.in',
      })
    }
  }, [sceneProgress])

  const narrative = NARRATIVES[currentScene]
  const accent    = narrative.accent ?? '#60a5fa'

  return (
    <div
      className="fixed pointer-events-none select-none"
      style={{
        zIndex: 28,
        left:   'clamp(24px, 4vw, 56px)',
        bottom: 'clamp(88px, 10vh, 120px)',
      }}
    >
      <div
        ref={containerRef}
        style={{ opacity: 0, transform: 'translateY(20px)', filter: 'blur(4px)' }}
      >
        {/* Left accent bar */}
        <div
          className="absolute left-0 top-1 bottom-1 w-0.5 rounded-full"
          style={{ background: accent, boxShadow: `0 0 8px ${accent}` }}
        />

        <div className="pl-5 max-w-xs sm:max-w-sm">
          {/* Eyebrow */}
          <p
            className="font-mono uppercase"
            style={{
              fontSize:      '9px',
              letterSpacing: '0.22em',
              color:         accent,
              marginBottom:  '6px',
              opacity:       0.9,
            }}
          >
            {narrative.eyebrow}
          </p>

          {/* Headline */}
          <h2
            style={{
              fontFamily:    'var(--font-cinematic)',
              fontSize:      'clamp(18px, 2.2vw, 28px)',
              fontWeight:    300,
              letterSpacing: '-0.02em',
              color:         'rgba(255,255,255,0.94)',
              lineHeight:    1.15,
              marginBottom:  '8px',
            }}
          >
            {narrative.headline}
          </h2>

          {/* Body */}
          <p
            style={{
              fontFamily:    'var(--font-display)',
              fontSize:      'clamp(11px, 1.1vw, 13px)',
              color:         'rgba(255,255,255,0.50)',
              lineHeight:    1.6,
              letterSpacing: '0.01em',
            }}
          >
            {narrative.body}
          </p>
        </div>
      </div>
    </div>
  )
}
