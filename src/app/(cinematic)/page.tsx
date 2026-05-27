import { VideoCanvas } from '@components/canvas/VideoCanvas'

/**
 * VICMARG cinematic home page — the full experience lives here.
 *
 * Layer stack (z-index):
 *   z-10  VideoCanvas       — fixed full-screen video background (ARRIVAL → CONVERSION)
 *   z-20  #scroll-narrative — Phase 3 scroll driver + scene content panels
 *   z-40+ overlays          — Phase 4 glassmorphism overlays (receptionist, CTA, etc.)
 */
export default function HomePage() {
  return (
    <>
      {/* Layer 0: Full-screen cinematic video background */}
      <VideoCanvas />

      {/* Layer 1: Scroll narrative driver — Phase 3 populates scene content here */}
      <div
        id="scroll-narrative"
        className="relative h-dvh overflow-y-auto"
        style={{ zIndex: 20, scrollBehavior: 'auto' }}
      >
        {/* 4-scene scroll space: ~4× viewport height for phase-locked scrubbing */}
        <div style={{ height: '400vh' }} aria-hidden="true" />
      </div>
    </>
  )
}
