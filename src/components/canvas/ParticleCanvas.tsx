'use client'

// ParticleCanvas — floating luminous particles drifting upward.
// z-19: above AtmosphericCanvas (z-11), below scroll-hint (z-26).
// Canvas 2D — no external dependencies, 60fps via requestAnimationFrame.
// Particle count and color adapt per scene.

import { useEffect, useRef } from 'react'
import { useSceneStore, selectCurrentScene } from '@store/scene.store'
import type { SceneId } from '@types-app'

interface Particle {
  x:          number
  y:          number
  vx:         number
  vy:         number
  r:          number
  opacity:    number
  maxOpacity: number
  phase:      number   // life phase: 0=fade-in 0.2=hold 0.8=fade-out 1=reset
  phaseSpeed: number
  rgb:        string   // e.g. "96,165,250"
}

const SCENE_RGB: Record<SceneId, string> = {
  ARRIVAL:    '96,165,250',   // cobalt blue
  GREETING:   '120,200,255',  // sky blue
  DISCOVERY:  '59,130,246',   // electric blue
  CONVERSION: '245,158,11',   // executive gold
}

const PARTICLE_COUNT = typeof window !== 'undefined' && window.innerWidth < 768 ? 40 : 72

function createParticle(w: number, h: number, rgb: string): Particle {
  return {
    x:          Math.random() * w,
    y:          Math.random() * h,
    vx:         (Math.random() - 0.5) * 0.4,
    vy:         -(Math.random() * 1.2 + 0.3),
    r:          Math.random() * 1.5 + 0.5,
    opacity:    0,
    maxOpacity: Math.random() * 0.45 + 0.15,
    phase:      Math.random(),
    phaseSpeed: Math.random() * 0.004 + 0.002,
    rgb,
  }
}

function resetParticle(p: Particle, w: number, h: number): void {
  p.x     = Math.random() * w
  p.y     = h + 10
  p.vx    = (Math.random() - 0.5) * 0.4
  p.vy    = -(Math.random() * 1.2 + 0.3)
  p.phase = 0
}

export function ParticleCanvas() {
  const canvasRef  = useRef<HTMLCanvasElement>(null)
  const particles  = useRef<Particle[]>([])
  const rafRef     = useRef<number>(0)
  const rgbRef     = useRef<string>('96,165,250')
  const currentScene = useSceneStore(selectCurrentScene)

  // Update target color when scene changes (smooth transition handled per-particle)
  rgbRef.current = SCENE_RGB[currentScene]

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio ?? 1, 2)
      canvas.width  = window.innerWidth  * dpr
      canvas.height = window.innerHeight * dpr
      canvas.style.width  = `${window.innerWidth}px`
      canvas.style.height = `${window.innerHeight}px`
      ctx.scale(dpr, dpr)
    }

    resize()
    window.addEventListener('resize', resize, { passive: true })

    // Initialise particles spread across the screen
    particles.current = Array.from({ length: PARTICLE_COUNT }, () =>
      createParticle(window.innerWidth, window.innerHeight, rgbRef.current)
    )

    const draw = () => {
      const w = window.innerWidth
      const h = window.innerHeight
      ctx.clearRect(0, 0, w, h)

      for (const p of particles.current) {
        // Slowly drift toward current scene color
        p.rgb = rgbRef.current

        // Advance phase
        p.phase += p.phaseSpeed
        if (p.phase >= 1) {
          resetParticle(p, w, h)
          continue
        }

        // Opacity curve: 0→max at phase 0.2, hold, fade at 0.75→0
        if (p.phase < 0.2) {
          p.opacity = (p.phase / 0.2) * p.maxOpacity
        } else if (p.phase < 0.75) {
          p.opacity = p.maxOpacity
        } else {
          p.opacity = ((1 - p.phase) / 0.25) * p.maxOpacity
        }

        // Move
        p.x += p.vx
        p.y += p.vy

        // Wrap horizontally
        if (p.x < -5) p.x = w + 5
        if (p.x > w + 5) p.x = -5

        // Draw glow dot
        ctx.save()
        ctx.shadowBlur  = p.r * 6
        ctx.shadowColor = `rgba(${p.rgb},${p.opacity})`
        ctx.fillStyle   = `rgba(${p.rgb},${p.opacity})`
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
        ctx.fill()
        ctx.restore()
      }

      rafRef.current = requestAnimationFrame(draw)
    }

    // Pause when tab is hidden to save resources
    const onVisibility = () => {
      if (document.hidden) {
        cancelAnimationFrame(rafRef.current)
      } else {
        rafRef.current = requestAnimationFrame(draw)
      }
    }
    document.addEventListener('visibilitychange', onVisibility)

    rafRef.current = requestAnimationFrame(draw)

    return () => {
      cancelAnimationFrame(rafRef.current)
      window.removeEventListener('resize', resize)
      document.removeEventListener('visibilitychange', onVisibility)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      style={{
        position:      'fixed',
        inset:         0,
        zIndex:        19,
        pointerEvents: 'none',
        mixBlendMode:  'screen',
      }}
    />
  )
}
