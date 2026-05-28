import { VideoCanvas }        from '@components/canvas/VideoCanvas'
import { AtmosphericCanvas }  from '@components/canvas/AtmosphericCanvas'
import { OverlayContainer }   from '@components/overlays/OverlayContainer'
import { DiscoveryHologram }  from '@components/hologram/DiscoveryHologram'
import { DevRuntimePanel }    from '@components/dev/DevRuntimePanel'

/**
 * VICMARG cinematic home page — the full experience lives here.
 *
 * Layer stack (z-index):
 *   z-10    VideoCanvas        — fixed full-screen HLS video background
 *   z-11    AtmosphericCanvas  — per-scene CSS gradient atmosphere (depth + emotion)
 *   z-20    #scroll-narrative  — scroll driver → SceneManager FSM triggers
 *   z-30    DiscoveryHologram  — Three.js hologram, HIGH tier + DISCOVERY scene only
 *   z-40    OverlayContainer   — Framer Motion glassmorphism overlays
 *   z-9999  DevRuntimePanel    — dev-only runtime health HUD (stripped in production)
 */
export default function HomePage() {
  return (
    <>
      {/* Layer 0: Full-screen cinematic video background */}
      <VideoCanvas />

      {/* Layer 1: Per-scene atmospheric color grading — depth and emotional palette */}
      <AtmosphericCanvas />

      {/* Layer 2: Scroll narrative driver — 400vh = 4 scenes × 100vh */}
      <div
        id="scroll-narrative"
        className="relative h-dvh overflow-y-auto"
        style={{ zIndex: 20, scrollBehavior: 'auto' }}
      >
        <div id="scroll-content" style={{ height: '400vh' }} aria-hidden="true" />
      </div>

      {/* Layer 3: Three.js hologram — DISCOVERY scene, HIGH tier only, pointer-events:none */}
      <DiscoveryHologram />

      {/* Layer 4: Overlay system — glassmorphism panels, Framer Motion enter/exit */}
      <OverlayContainer />

      {/* Dev only — stripped by Next.js in production via process.env.NODE_ENV check */}
      {process.env.NODE_ENV === 'development' && <DevRuntimePanel />}
    </>
  )
}
