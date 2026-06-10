// ─── VICMARG Scenes Configuration ────────────────────────────────────────────
// Master registry of the 4 cinematic scenes.
// Source of truth for SceneRegistry.ts and VideoEngine manifests.
// All videos: Veo 3.1 · First-person · Anamorphic · 24fps · ACES Filmic
// ───────────────────────────────────────────────────────────────────────────

import type { SceneConfig, VideoManifest } from '@types-app'

// ─── Video Manifests ─────────────────────────────────────────────────────────
// URLs point to Cloudflare R2 via the /videos proxy rewrite in next.config.ts
export const VIDEO_MANIFESTS: Record<string, VideoManifest> = {
  arrival: {
    sceneId:           'arrival',
    masterPlaylistUrl: '/videos/scenes/arrival/video.mp4',
    posterUrl:         '/videos/scenes/arrival/poster.jpg',
    posterBlurUrl:     '/videos/scenes/arrival/poster-blur.jpg',
    durationMs:        8_000,
    aspectRatio:       '16:9',
    qualities:         ['1080p'],
  },
  greeting: {
    sceneId:           'greeting',
    masterPlaylistUrl: '/videos/scenes/greeting/video.mp4',
    posterUrl:         '/videos/scenes/greeting/poster.jpg',
    posterBlurUrl:     '/videos/scenes/greeting/poster-blur.jpg',
    durationMs:        8_000,
    aspectRatio:       '16:9',
    qualities:         ['1080p'],
  },
  discovery: {
    sceneId:           'discovery',
    masterPlaylistUrl: '/videos/scenes/discovery/video.mp4',
    posterUrl:         '/videos/scenes/discovery/poster.jpg',
    posterBlurUrl:     '/videos/scenes/discovery/poster-blur.jpg',
    durationMs:        8_000,
    aspectRatio:       '16:9',
    qualities:         ['1080p'],
  },
  conversion: {
    sceneId:           'conversion',
    masterPlaylistUrl: '/videos/scenes/conversion/video.mp4',
    posterUrl:         '/videos/scenes/conversion/poster.jpg',
    posterBlurUrl:     '/videos/scenes/conversion/poster-blur.jpg',
    durationMs:        8_000,
    aspectRatio:       '16:9',
    qualities:         ['1080p'],
  },
} as const

// ─── Scene Configurations ──────────────────────────────────────────────────
export const SCENES_CONFIG: Record<string, SceneConfig> = {
  ARRIVAL: {
    id:              'ARRIVAL',
    label:           'Arrival',
    emotionalIntent: 'Impacto y curiosidad — primer contacto con el universo VICMARG',
    durationMs:      10_000,
    nextScene:       'GREETING',
    gsapTimelineKey: 'arrival',
    videoManifestKey:'arrival',
    threeJSEnabled:  false,
    overlayTriggers: [
      // No overlays in Arrival — pure cinematic impact
    ],
  },

  GREETING: {
    id:              'GREETING',
    label:           'Greeting',
    emotionalIntent: 'Confianza y conexión — la recepcionista IA te recibe por nombre',
    durationMs:      15_000,
    nextScene:       'DISCOVERY',
    gsapTimelineKey: 'greeting',
    videoManifestKey:'greeting',
    threeJSEnabled:  false,
    overlayTriggers: [
      {
        overlayId:            'receptionist-name-capture',
        triggerAtProgress:    0.27, // ~4 seconds into the 15s scene
        priority:             4,
        dismissOnSceneChange: true,
      },
    ],
  },

  DISCOVERY: {
    id:              'DISCOVERY',
    label:           'Discovery',
    emotionalIntent: 'Asombro y exploración — el ecosistema VICMARG se despliega',
    durationMs:      20_000,
    nextScene:       'CONVERSION',
    gsapTimelineKey: 'discovery',
    videoManifestKey:'discovery',
    threeJSEnabled:  true,
    overlayTriggers: [
      {
        // Funnel gate: asks affiliation → routes to services or pre-registration
        overlayId:            'affiliation-check',
        triggerAtProgress:    0.30,
        priority:             4,
        dismissOnSceneChange: true,
      },
      // services-hologram-menu is now triggered by OverlaySystem after affiliation confirmed
    ],
  },

  CONVERSION: {
    id:              'CONVERSION',
    label:           'Conversion',
    emotionalIntent: 'Aspiración y decisión — el momento de transformación',
    durationMs:      12_000,
    nextScene:       null, // Terminal scene
    gsapTimelineKey: 'conversion',
    videoManifestKey:'conversion',
    threeJSEnabled:  false,
    overlayTriggers: [
      {
        overlayId:            'premium-cta',
        triggerAtProgress:    0.40, // CTA appears at midpoint
        priority:             5,    // Highest priority — conversion critical
        dismissOnSceneChange: false,// Stays visible
      },
    ],
  },
} as const

// ─── Scene Order ─────────────────────────────────────────────────────────────
export const SCENE_SEQUENCE = ['ARRIVAL', 'GREETING', 'DISCOVERY', 'CONVERSION'] as const

// ─── Scene Transition Durations ────────────────────────────────────────────
export const TRANSITION_CONFIG = {
  crossfadeDurationMs: 800,   // GSAP crossfade — zero black frames
  lockDurationMs:      900,   // Scene locked during + 100ms buffer
  preloadTrigger:      0.60,  // Preload next at 60% of current
} as const
