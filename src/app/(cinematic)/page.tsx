import { VideoCanvas }        from '@components/canvas/VideoCanvas'
import { AtmosphericCanvas }  from '@components/canvas/AtmosphericCanvas'
import { OverlayContainer }   from '@components/overlays/OverlayContainer'
import { DiscoveryHologram }  from '@components/hologram/DiscoveryHologram'
import { VicmargFooter }      from '@components/cinematic/VicmargFooter'
import { DevRuntimePanel }    from '@components/dev/DevRuntimePanel'

/**
 * VICMARG cinematic home page.
 *
 * Scroll architecture: window scroll drives everything.
 * The 400vh spacer creates the scroll space. All visual layers are fixed.
 *
 * Layer stack (z-index):
 *   z-10    VideoCanvas        — fixed full-screen video background
 *   z-11    AtmosphericCanvas  — per-scene CSS gradient atmosphere
 *   z-26    ScrollHint         — initial "desplázate" indicator (inside VideoCanvas)
 *   z-30    DiscoveryHologram  — Three.js hologram, HIGH tier + DISCOVERY only
 *   z-35    VicmargFooter      — fixed bottom bar
 *   z-40    OverlayContainer   — Framer Motion glassmorphism overlays
 *   z-9999  DevRuntimePanel    — dev-only runtime HUD
 */
export default function HomePage() {
  return (
    <>
      {/* Scroll space — 400vh creates 4 scenes × 100vh of window scroll */}
      <div style={{ height: '400vh' }} aria-hidden="true" />

      {/* Fixed visual layers — rendered above the scroll spacer */}
      <VideoCanvas />
      <AtmosphericCanvas />
      <DiscoveryHologram />
      <OverlayContainer />
      <VicmargFooter />

      {process.env.NODE_ENV === 'development' && <DevRuntimePanel />}
    </>
  )
}
