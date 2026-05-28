'use client'

// AtmosphericCanvas — per-scene cinematic atmosphere layer.
// z-11: above VideoCanvas (z-10), below scroll-narrative (z-20).
// Pure CSS gradients + transitions — zero JS animation overhead.
// 900ms ease (slightly slower than 800ms video crossfade) creates depth:
// the atmosphere lingers a beat after the video cuts.
//
// Emotional palette per scene:
//   ARRIVAL    — deep space navy.  Vast, dark, mysterious.
//   GREETING   — steel executive.  Composed, welcoming, professional.
//   DISCOVERY  — electric cobalt.  Dynamic, holographic, alive.
//   CONVERSION — premium warm.     Decisive, gold-lit, exclusive.

import { useSceneStore } from '@store/scene.store'
import type { SceneId }  from '@types-app'

interface SceneAtmosphere {
  base:   string   // Full-screen depth gradient
  glow:   string   // Primary emotional glow orb
  accent: string   // Secondary highlight
}

const ATMOSPHERE: Record<SceneId, SceneAtmosphere> = {
  ARRIVAL: {
    base:   'linear-gradient(180deg, #04050e 0%, #080c1c 55%, #0e1530 100%)',
    glow:   'radial-gradient(ellipse 85% 52% at 50% 108%, rgba(30,58,138,0.44) 0%, rgba(14,21,48,0.18) 52%, transparent 70%)',
    accent: 'radial-gradient(ellipse 22% 13% at 74% 22%, rgba(59,130,246,0.07) 0%, transparent 58%)',
  },
  GREETING: {
    base:   'linear-gradient(148deg, #07091b 0%, #09101f 48%, #060a12 100%)',
    glow:   'radial-gradient(ellipse 62% 52% at 22% 90%, rgba(29,64,175,0.36) 0%, rgba(15,20,45,0.14) 56%, transparent 72%)',
    accent: 'radial-gradient(ellipse 34% 22% at 80% 30%, rgba(160,120,50,0.06) 0%, transparent 58%)',
  },
  DISCOVERY: {
    base:   'linear-gradient(180deg, #060912 0%, #0a1428 52%, #0e1c3c 100%)',
    glow:   'radial-gradient(ellipse 95% 68% at 50% 50%, rgba(29,78,216,0.40) 0%, rgba(12,22,60,0.16) 58%, transparent 74%)',
    accent: 'radial-gradient(ellipse 40% 24% at 70% 18%, rgba(96,165,250,0.13) 0%, transparent 56%)',
  },
  CONVERSION: {
    base:   'linear-gradient(158deg, #070608 0%, #0d0b0e 48%, #130f0a 100%)',
    glow:   'radial-gradient(ellipse 68% 52% at 68% 96%, rgba(180,100,20,0.32) 0%, rgba(25,16,8,0.14) 56%, transparent 72%)',
    accent: 'radial-gradient(ellipse 32% 22% at 24% 18%, rgba(245,158,11,0.07) 0%, transparent 58%)',
  },
}

const TRANSITION = 'opacity 900ms cubic-bezier(0.76, 0, 0.24, 1)'

export function AtmosphericCanvas() {
  const currentScene = useSceneStore((s) => s.currentScene)

  return (
    <div
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: 11 }}
      aria-hidden="true"
    >
      {(Object.keys(ATMOSPHERE) as SceneId[]).map((sceneId) => {
        const atm      = ATMOSPHERE[sceneId]
        const isActive = sceneId === currentScene

        return (
          <div
            key={sceneId}
            className="absolute inset-0"
            style={{
              opacity:    isActive ? 1 : 0,
              transition: TRANSITION,
              willChange: 'opacity',
            }}
          >
            <div className="absolute inset-0" style={{ background: atm.base   }} />
            <div className="absolute inset-0" style={{ background: atm.glow   }} />
            <div className="absolute inset-0" style={{ background: atm.accent }} />
          </div>
        )
      })}
    </div>
  )
}
