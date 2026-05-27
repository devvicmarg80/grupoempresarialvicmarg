// VideoEngine — HLS.js orchestration for the 4 cinematic scenes.
// Singleton: import { VideoEngine } from '@systems/video/VideoEngine'
// Only VideoCanvas.tsx calls attachElement / detachElement / loadScene / play.
// State updates flow to Zustand stores. Cross-system comms via EventBus only.

import Hls from 'hls.js'
import { eventBus } from '@lib/event-bus'
import { useVideoStore } from '@store/video.store'
import { usePerformanceStore } from '@store/performance.store'
import { useUserStore } from '@store/user.store'
import { VIDEO_MANIFESTS } from '@config/scenes.config'
import { HLS_CONFIGS, VIDEO_MEMORY_BUDGET } from '@config/performance.config'
import type { DeviceTier, MobileVideoStrategy } from '@types-app'

class VideoEngineClass {
  private readonly videoElements = new Map<string, HTMLVideoElement>()
  private readonly hlsInstances  = new Map<string, Hls>()
  private initialized = false
  private readonly cleanupFns: Array<() => void> = []

  /** Initialize EventBus subscriptions. Call once in SystemProvider. */
  init(): void {
    if (this.initialized) return

    const unsubDetection = eventBus.on('performance:detection:complete', () => {
      this.applyMobileStrategy()
    })

    const unsubProgress = eventBus.on('scene:progress:update', ({ scene, progress }) => {
      if (progress < VIDEO_MEMORY_BUDGET.preloadTriggerProgress) return
      const next = this.getNextSceneId(scene)
      if (next && !this.hlsInstances.has(next)) {
        void this.preloadScene(next)
      }
    })

    this.cleanupFns.push(unsubDetection, unsubProgress)
    this.initialized = true
    eventBus.emit('system:ready', { systemName: 'VideoEngine' })
  }

  /** Register a DOM video element for a scene. Called from ref callback in VideoCanvas. */
  attachElement(sceneId: string, el: HTMLVideoElement): void {
    this.videoElements.set(sceneId, el)
  }

  /** Remove and clean up a scene's element. Called on ref null in VideoCanvas. */
  detachElement(sceneId: string): void {
    this.destroyHLS(sceneId)
    this.videoElements.delete(sceneId)
  }

  /** Load HLS manifest for a scene into its registered video element. */
  async loadScene(sceneId: string): Promise<void> {
    const manifest = VIDEO_MANIFESTS[sceneId.toLowerCase()]
    if (!manifest) return

    const el = this.videoElements.get(sceneId)
    if (!el) return

    const { mobileStrategy } = useVideoStore.getState()
    const { deviceTier }     = usePerformanceStore.getState()

    useVideoStore.getState().setActiveVideo(sceneId)
    useVideoStore.getState().setPlaybackState('loading')
    eventBus.emit('video:loading', { sceneId })

    if (mobileStrategy === 'native-hls') {
      el.src = manifest.masterPlaylistUrl
      el.load()
      this.attachNativeListeners(sceneId, el)
    } else if (typeof window !== 'undefined' && Hls.isSupported()) {
      this.loadWithHLS(sceneId, el, manifest.masterPlaylistUrl, deviceTier)
    } else {
      // No HLS support — poster only, no video playback
      useVideoStore.getState().setPlaybackState('paused')
    }
  }

  /** Start playback. Always muted for autoplay policy compliance. */
  async play(sceneId: string): Promise<void> {
    const el = this.videoElements.get(sceneId)
    if (!el) return

    el.muted       = true
    el.playsInline = true

    try {
      await el.play()
      useVideoStore.getState().setPlaybackState('playing')
      eventBus.emit('video:playing', { sceneId, currentTime: el.currentTime })
    } catch {
      // Autoplay blocked — will retry on first user interaction
      useVideoStore.getState().setPlaybackState('paused')
    }
  }

  pause(sceneId: string): void {
    const el = this.videoElements.get(sceneId)
    if (!el) return
    el.pause()
    useVideoStore.getState().setPlaybackState('paused')
    eventBus.emit('video:paused', { sceneId })
  }

  /** Call on first user gesture to unlock audio for future AI receptionist voice. */
  unlockAutoplay(): void {
    useUserStore.getState().setInteracted(true)
    eventBus.emit('user:first:interaction', {})
  }

  /** Full teardown. Call in SystemProvider useEffect cleanup. */
  destroy(): void {
    this.hlsInstances.forEach((hls) => hls.destroy())
    this.hlsInstances.clear()
    this.videoElements.clear()
    this.cleanupFns.forEach((fn) => fn())
    this.cleanupFns.length = 0
    this.initialized = false
    eventBus.emit('system:destroyed', { systemName: 'VideoEngine' })
  }

  get isReady(): boolean {
    return this.initialized
  }

  // ─── Private ──────────────────────────────────────────────────────────────

  private loadWithHLS(
    sceneId:  string,
    el:       HTMLVideoElement,
    url:      string,
    tier:     DeviceTier,
  ): void {
    this.destroyHLS(sceneId)

    const cfg = HLS_CONFIGS[tier]
    const hls = new Hls({
      maxBufferLength:         cfg.maxBufferLength,
      maxBufferSize:           cfg.maxBufferSize,
      startLevel:              cfg.startLevel,
      enableWorker:            true,
      lowLatencyMode:          false,
      fragLoadingMaxRetry:     cfg.fragLoadingMaxRetry,
      manifestLoadingMaxRetry: cfg.manifestLoadingMaxRetry,
    })

    hls.once(Hls.Events.MANIFEST_PARSED, () => {
      useVideoStore.getState().setPlaybackState('buffering')
    })

    el.addEventListener('canplay', () => {
      useVideoStore.getState().setBufferProgress(0.2)
    }, { once: true })

    hls.on(Hls.Events.ERROR, (_event, data) => {
      if (!data.fatal) return
      const err = String(data.details)
      eventBus.emit('video:error', { sceneId, error: err, fatal: true })
      useVideoStore.getState().setError(err)
      if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
        hls.startLoad()
      } else {
        this.destroyHLS(sceneId)
      }
    })

    hls.loadSource(url)
    hls.attachMedia(el)
    this.hlsInstances.set(sceneId, hls)
  }

  private attachNativeListeners(sceneId: string, el: HTMLVideoElement): void {
    el.addEventListener('canplay', () => {
      useVideoStore.getState().setPlaybackState('buffering')
      useVideoStore.getState().setBufferProgress(0.2)
    }, { once: true })

    el.addEventListener('error', () => {
      const err = el.error?.message ?? 'native_hls_error'
      useVideoStore.getState().setError(err)
      eventBus.emit('video:error', { sceneId, error: err, fatal: false })
    }, { once: true })
  }

  private async preloadScene(sceneId: string): Promise<void> {
    const { currentFPS } = usePerformanceStore.getState()
    if (currentFPS < VIDEO_MEMORY_BUDGET.preloadAbortFPSThreshold) {
      eventBus.emit('video:preload:aborted', { sceneId, reason: 'fps_below_threshold' })
      return
    }
    const manifest = VIDEO_MANIFESTS[sceneId.toLowerCase()]
    if (!manifest) return

    const el = this.videoElements.get(sceneId)
    if (!el || this.hlsInstances.has(sceneId)) return

    const { deviceTier } = usePerformanceStore.getState()
    eventBus.emit('video:preload:start', { sceneId })
    this.loadWithHLS(sceneId, el, manifest.masterPlaylistUrl, deviceTier)
    eventBus.emit('video:preload:complete', { sceneId })
  }

  private applyMobileStrategy(): void {
    const { capabilities } = usePerformanceStore.getState()
    if (!capabilities) return

    let strategy: MobileVideoStrategy = 'hls'
    if (capabilities.isIOS || capabilities.isSafari) {
      strategy = 'native-hls'
    } else if (typeof window !== 'undefined' && !Hls.isSupported()) {
      strategy = 'poster-fallback'
    }
    useVideoStore.getState().setMobileStrategy(strategy)
  }

  private destroyHLS(sceneId: string): void {
    const hls = this.hlsInstances.get(sceneId)
    if (!hls) return
    hls.destroy()
    this.hlsInstances.delete(sceneId)
  }

  private getNextSceneId(sceneId: string): string | null {
    const order = ['ARRIVAL', 'GREETING', 'DISCOVERY', 'CONVERSION']
    const idx   = order.indexOf(sceneId)
    return idx >= 0 && idx < order.length - 1 ? (order[idx + 1] ?? null) : null
  }
}

export const VideoEngine = new VideoEngineClass()
