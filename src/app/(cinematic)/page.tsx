import { VideoCanvas }      from '@components/canvas/VideoCanvas'
import { OverlayContainer } from '@components/overlays/OverlayContainer'

/**
 * VICMARG cinematic home page — the full experience lives here.
 *
 * Layer stack (z-index):
 *   z-10  VideoCanvas       — fixed full-screen video background (ARRIVAL → CONVERSION)
 *   z-20  #scroll-narrative — Phase 3 scroll driver + scene FSM trigger
 *   z-40  OverlayContainer  — Framer Motion AnimatePresence glassmorphism overlays
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

      {/* Layer 2: Overlay system — glassmorphism panels, animated with Framer Motion */}
      <OverlayContainer />
    </>
  )
}
