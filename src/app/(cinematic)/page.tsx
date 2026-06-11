import { VideoCanvas }        from '@components/canvas/VideoCanvas'
import { AtmosphericCanvas }  from '@components/canvas/AtmosphericCanvas'
import { ParticleCanvas }     from '@components/canvas/ParticleCanvas'
import { AmbientGlow }        from '@components/canvas/AmbientGlow'
import { FilmGrain }          from '@components/canvas/FilmGrain'
import { OverlayContainer }   from '@components/overlays/OverlayContainer'
import { DiscoveryHologram }  from '@components/hologram/DiscoveryHologram'
import { VicmargFooter }      from '@components/cinematic/VicmargFooter'
import { SceneNarrative }     from '@components/cinematic/SceneNarrative'
import { SceneCounter }       from '@components/cinematic/SceneCounter'
import { ScrollProgressBar }  from '@components/cinematic/ScrollProgressBar'
import { DevRuntimePanel }    from '@components/dev/DevRuntimePanel'

/**
 * VICMARG cinematic home page.
 *
 * Scroll architecture: window scroll drives everything.
 * The 400vh spacer creates the scroll space. All visual layers are fixed.
 *
 * Layer stack (z-index):
 *   z-10    VideoCanvas        — fixed full-screen video background
 *   z-11    AtmosphericCanvas  — per-scene CSS gradient atmosphere (+ rim lights)
 *   z-16    AmbientGlow        — idle breathing glow + scan ray
 *   z-19    ParticleCanvas     — scene-aware particles (gold on CONVERSION)
 *   z-26    VideoCanvas HUD    — "VICMARG" hero title + scroll hint
 *   z-28    SceneNarrative     — per-scene storytelling text (bottom-left)
 *   z-28    SceneCounter       — "01 / 04" scene HUD (top-right)
 *   z-30    DiscoveryHologram  — Three.js hologram (HIGH tier + DISCOVERY only)
 *   z-35    VicmargFooter      — fixed bottom bar with logo + nav
 *   z-40    OverlayContainer   — Framer Motion glassmorphism overlays
 *   z-50    FilmGrain          — imperceptible analog noise texture
 *   z-60    ScrollProgressBar  — 1px scroll progress line at top
 *   z-9999  DevRuntimePanel    — dev-only runtime HUD
 */
export default function HomePage() {
  return (
    <>
      {/* Scroll space — 400vh = 4 scenes × 100vh */}
      <div style={{ height: '400vh' }} aria-hidden="true" />

      {/* Fixed visual layers */}
      <VideoCanvas />
      <AtmosphericCanvas />
      <AmbientGlow />
      <ParticleCanvas />
      <DiscoveryHologram />
      <SceneNarrative />
      <SceneCounter />
      <OverlayContainer />
      <VicmargFooter />
      <FilmGrain />
      <ScrollProgressBar />

      {process.env.NODE_ENV === 'development' && <DevRuntimePanel />}
    </>
  )
}
