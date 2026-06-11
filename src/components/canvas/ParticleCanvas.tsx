'use client'

// ParticleCanvas — floating luminous particles, scene-aware color + density.
// CONVERSION: gold particles, larger, slower — "executive decision" gravity.
// DISCOVERY:  electric blue, higher density, faster — "alive with data" energy.
// Performance: Canvas 2D, RAF, pauses on hidden tab, max 72 desktop / 40 mobile.

import { useEffect, useRef } from 'react'
import { useSceneStore }     from '@store/scene.store'
import type { SceneId }      from '@types-app'

interface Particle {
  x: number; y: number
  vx: number; vy: number
  r: number; phase: number; opacity: number
}

interface SceneCfg {
  rgb: string; count: number
  minR: number; maxR: number
  speed: number; glow: number
}

const CFG: Record<SceneId, SceneCfg> = {
  ARRIVAL:    { rgb: '96,165,250',  count: 55, minR: 0.8, maxR: 2.2, speed: 0.30, glow: 8  },
  GREETING:   { rgb: '120,200,255', count: 62, minR: 0.9, maxR: 2.4, speed: 0.35, glow: 9  },
  DISCOVERY:  { rgb: '59,130,246',  count: 72, minR: 0.8, maxR: 2.6, speed: 0.50, glow: 12 },
  CONVERSION: { rgb: '245,158,11',  count: 52, minR: 1.0, maxR: 3.2, speed: 0.22, glow: 16 },
}

function makePt(w: number, h: number, cfg: SceneCfg): Particle {
  const a = Math.random() * Math.PI * 2
  const s = (0.4 + Math.random() * 0.6) * cfg.speed
  return {
    x: Math.random() * w, y: Math.random() * h,
    vx: Math.cos(a) * s, vy: Math.sin(a) * s,
    r: cfg.minR + Math.random() * (cfg.maxR - cfg.minR),
    phase: Math.random(), opacity: 0,
  }
}

function lerpRgb(from: string, to: string, t: number): string {
  const a = from.split(',').map(Number) as [number, number, number]
  const b = to.split(',').map(Number)   as [number, number, number]
  return `${Math.round(a[0]+(b[0]-a[0])*t)},${Math.round(a[1]+(b[1]-a[1])*t)},${Math.round(a[2]+(b[2]-a[2])*t)}`
}

export function ParticleCanvas() {
  const currentScene = useSceneStore((s) => s.currentScene)
  const canvasRef    = useRef<HTMLCanvasElement>(null)
  const sceneRef     = useRef<SceneId>(currentScene)
  const rafRef       = useRef<number | null>(null)
  const pts          = useRef<Particle[]>([])
  const transT       = useRef(1)
  const prevRgb      = useRef(CFG[currentScene].rgb)
  const targRgb      = useRef(CFG[currentScene].rgb)

  useEffect(() => {
    if (sceneRef.current === currentScene) return
    prevRgb.current  = targRgb.current
    targRgb.current  = CFG[currentScene].rgb
    transT.current   = 0
    sceneRef.current = currentScene
  }, [currentScene])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    const mobile = window.innerWidth < 768

    function resize() {
      if (!canvas) return
      canvas.width  = window.innerWidth
      canvas.height = window.innerHeight
      const cfg = CFG[sceneRef.current]
      const cnt = mobile ? Math.floor(cfg.count * 0.55) : cfg.count
      pts.current = Array.from({ length: cnt }, () => makePt(canvas.width, canvas.height, cfg))
    }

    resize()
    window.addEventListener('resize', resize, { passive: true })

    let lastTs = 0
    function draw(ts: number) {
      if (!canvas || !ctx) return
      rafRef.current = requestAnimationFrame(draw)
      const dt = Math.min((ts - lastTs) / 16.67, 3)
      lastTs = ts

      if (transT.current < 1) transT.current = Math.min(1, transT.current + 0.022 * dt)
      const rgb = lerpRgb(prevRgb.current, targRgb.current, transT.current)
      const cfg = CFG[sceneRef.current]

      ctx.clearRect(0, 0, canvas.width, canvas.height)

      for (const p of pts.current) {
        p.phase = (p.phase + 0.0015 * dt * (cfg.speed / 0.35)) % 1

        if      (p.phase < 0.18) p.opacity = p.phase / 0.18
        else if (p.phase < 0.75) p.opacity = 1
        else                      p.opacity = 1 - (p.phase - 0.75) / 0.25
        p.opacity = Math.max(0, Math.min(1, p.opacity)) * 0.62

        p.x += p.vx * dt
        p.y += p.vy * dt
        if (p.x < -p.r * 4) p.x = canvas.width  + p.r
        if (p.x > canvas.width  + p.r * 4) p.x = -p.r
        if (p.y < -p.r * 4) p.y = canvas.height + p.r
        if (p.y > canvas.height + p.r * 4) p.y = -p.r

        if (p.opacity <= 0.01) continue

        ctx.save()
        ctx.globalAlpha = p.opacity
        ctx.shadowColor = `rgba(${rgb},0.9)`
        ctx.shadowBlur  = cfg.glow * (0.6 + p.r / cfg.maxR * 0.4)
        ctx.fillStyle   = `rgba(${rgb},1)`
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
        ctx.fill()

        // Extra gold halo for CONVERSION particles
        if (sceneRef.current === 'CONVERSION' && p.r > 1.8) {
          ctx.globalAlpha = p.opacity * 0.28
          ctx.shadowBlur  = cfg.glow * 2
          ctx.strokeStyle = `rgba(${rgb},0.5)`
          ctx.lineWidth   = 0.8
          ctx.beginPath()
          ctx.arc(p.x, p.y, p.r * 2.4, 0, Math.PI * 2)
          ctx.stroke()
        }
        ctx.restore()
      }
    }

    function onVis() {
      if (document.hidden) {
        if (rafRef.current) { cancelAnimationFrame(rafRef.current); rafRef.current = null }
      } else {
        lastTs = performance.now()
        rafRef.current = requestAnimationFrame(draw)
      }
    }

    document.addEventListener('visibilitychange', onVis)
    rafRef.current = requestAnimationFrame(draw)

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
      window.removeEventListener('resize', resize)
      document.removeEventListener('visibilitychange', onVis)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: 19, mixBlendMode: 'screen' }}
    />
  )
}
