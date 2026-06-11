'use client'

// AtmosphericCanvas — per-scene cinematic atmosphere layer.
// z-11: above VideoCanvas (z-10), below particles (z-19).
// Pure CSS gradients + transitions — zero JS animation overhead.
// 950ms ease (slightly slower than 900ms video crossfade) — atmosphere lingers.
//
// Premium upgrade: richer multi-layer gradients per scene.
//   ARRIVAL    — deep space navy + cobalt bloom from horizon.
//   GREETING   — executive steel + warm side accent.
//   DISCOVERY  — electric cobalt center glow + top-left edge light.
//   CONVERSION — warm ember bottom + gold dust accent — "prestige decision".

import { useSceneStore } from '@store/scene.store'
import type { SceneId }  from '@types-app'

interface Atmosphere {
  base:   string
  glow:   string
  accent: string
  rim?:   string  // new: edge/corner rim light
}

const ATMOSPHERE: Record<SceneId, Atmosphere> = {
  ARRIVAL: {
    base:   'linear-gradient(185deg, rgba(3,4,12,0.76) 0%, rgba(6,10,24,0.62) 50%, rgba(12,18,44,0.46) 100%)',
    glow:   'radial-gradient(ellipse 90% 56% at 50% 112%, rgba(25,52,128,0.50) 0%, rgba(12,18,44,0.20) 50%, transparent 68%)',
    accent: 'radial-gradient(ellipse 22% 14% at 76% 20%, rgba(59,130,246,0.09) 0%, transparent 56%)',
    rim:    'radial-gradient(ellipse 60% 18% at 50% 0%, rgba(30,64,175,0.12) 0%, transparent 70%)',
  },
  GREETING: {
    base:   'linear-gradient(150deg, rgba(6,8,26,0.74) 0%, rgba(8,14,30,0.62) 45%, rgba(5,9,16,0.46) 100%)',
    glow:   'radial-gradient(ellipse 65% 55% at 18% 94%, rgba(24,58,172,0.42) 0%, rgba(12,18,42,0.16) 54%, transparent 70%)',
    accent: 'radial-gradient(ellipse 36% 24% at 82% 28%, rgba(180,130,50,0.08) 0%, transparent 56%)',
    rim:    'radial-gradient(ellipse 40% 30% at 100% 50%, rgba(96,165,250,0.05) 0%, transparent 60%)',
  },
  DISCOVERY: {
    base:   'linear-gradient(185deg, rgba(4,8,16,0.74) 0%, rgba(8,18,38,0.62) 50%, rgba(12,26,60,0.46) 100%)',
    glow:   'radial-gradient(ellipse 100% 72% at 50% 50%, rgba(24,72,216,0.45) 0%, rgba(10,20,58,0.18) 56%, transparent 72%)',
    accent: 'radial-gradient(ellipse 42% 26% at 68% 16%, rgba(96,165,250,0.16) 0%, transparent 54%)',
    rim:    'radial-gradient(ellipse 30% 60% at 0% 50%, rgba(37,99,235,0.08) 0%, transparent 60%)',
  },
  CONVERSION: {
    base:   'linear-gradient(160deg, rgba(6,5,7,0.74) 0%, rgba(12,10,13,0.62) 45%, rgba(18,13,9,0.46) 100%)',
    glow:   'radial-gradient(ellipse 72% 55% at 70% 100%, rgba(190,110,20,0.38) 0%, rgba(24,15,7,0.16) 54%, transparent 70%)',
    accent: 'radial-gradient(ellipse 34% 24% at 22% 16%, rgba(245,158,11,0.09) 0%, transparent 56%)',
    rim:    'radial-gradient(ellipse 80% 20% at 50% 100%, rgba(245,158,11,0.10) 0%, transparent 60%)',
  },
}

const TRANSITION = 'opacity 950ms cubic-bezier(0.76, 0, 0.24, 1)'

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
            style={{ opacity: isActive ? 1 : 0, transition: TRANSITION, willChange: 'opacity' }}
          >
            <div className="absolute inset-0" style={{ background: atm.base   }} />
            <div className="absolute inset-0" style={{ background: atm.glow   }} />
            <div className="absolute inset-0" style={{ background: atm.accent }} />
            {atm.rim && (
              <div className="absolute inset-0" style={{ background: atm.rim }} />
            )}
          </div>
        )
      })}
    </div>
  )
}
