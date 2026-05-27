import { VideoCanvas }        from '@components/canvas/VideoCanvas'
import { OverlayContainer }   from '@components/overlays/OverlayContainer'
import { DiscoveryHologram }  from '@components/hologram/DiscoveryHologram'
import { DevRuntimePanel }    from '@components/dev/DevRuntimePanel'

/**
 * VICMARG cinematic home page — the full experience lives here.
 *
 * Layer stack (z-index):
 *   z-10    VideoCanvas       — fixed full-screen video background (ARRIVAL → CONVERSION)
 *   z-20    #scroll-narrative — scroll driver → SceneManager FSM triggers
 *   z-40    OverlayContainer  — Framer Motion glassmorphism overlays (Phase 4)
 *   z-9999  DevRuntimePanel   — dev-only runtime health HUD (stripped in production)
 */
export default function HomePage() {
  return (
    <>
      {/* Layer 0: Full-screen cinematic video background */}
      <VideoCanvas />

      {/* Layer 1: Scroll narrative driver — 400vh = 4 scenes × 100vh */}
      <div
        id="scroll-narrative"
        className="relative h-dvh overflow-y-auto"
        style={{ zIndex: 20, scrollBehavior: 'auto' }}
      >
        <div id="scroll-content" style={{ height: '400vh' }} aria-hidden="true" />
      </div>

      {/* Layer 2: Three.js hologram — DISCOVERY scene, HIGH tier only, pointer-events:none */}
      <DiscoveryHologram />

      {/* Layer 3: Overlay system — glassmorphism panels, Framer Motion enter/exit */}
      <OverlayContainer />

      {/* Dev only — stripped by Next.js in production via process.env.NODE_ENV check */}
      {process.env.NODE_ENV === 'development' && <DevRuntimePanel />}
    </>
  )
}
