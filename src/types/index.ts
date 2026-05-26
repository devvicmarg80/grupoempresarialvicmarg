// ─── VICMARG Types — Barrel Export ──────────────────────────────────────────
// Single import point: import type { SceneId, VideoState, ... } from '@types-app'
// Organized by system domain. No circular dependencies.
// ───────────────────────────────────────────────────────────────────────────

export type {
  SceneId,
  SceneTransitionState,
  OverlayTrigger,
  SceneConfig,
  SceneState,
  SceneActions,
  SceneTransitionPayload,
  FSMTransitionResult,
  SCENE_ORDER,
} from './scene.types'

export { SCENE_ORDER } from './scene.types'

export type {
  VideoQuality,
  PlaybackState,
  MobileVideoStrategy,
  VideoManifest,
  VideoState,
  VideoActions,
  HLSEngineConfig,
  VideoMemoryBudget,
} from './video.types'

export type {
  OverlayVisibilityState,
  OverlayPriority,
  GlassMaterialVariant,
  OverlayConfig,
  OverlayPosition,
  OverlayInstance,
  OverlaySystemState,
  OverlayActions,
} from './overlay.types'

export type {
  DeviceTier,
  ConnectionType,
  GlassLevel,
  DeviceCapabilities,
  PerformanceState,
  PerformanceActions,
  TierQualityBudget,
  FPSThresholds,
} from './performance.types'

export type {
  EasingKey,
  AnimationCommand,
  TimelineConfig,
  AnimationEventPayload,
  GSAPEffect,
  ScrollTriggerConfig,
} from './animation.types'

export type {
  VicmargSession,
  UserJourney,
  UserState,
  UserActions,
} from './user.types'
