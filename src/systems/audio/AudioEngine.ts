// AudioEngine — Web Audio API singleton. Cinematic ambient audio orchestration.
// Lifecycle: init() in SystemProvider → suspended until user gesture → scene-reactive.
// Mobile-safe: AudioContext created suspended, resumed on 'user:first:interaction'.
// Respects prefersReducedMotion (mutes entirely).
// Decoupled: EventBus only. No direct system imports.

import { eventBus }          from '@lib/event-bus'
import { useSceneStore }      from '@store/scene.store'
import { usePerformanceStore } from '@store/performance.store'
import { AmbientLayer }        from './AmbientLayer'
import type { SceneId }        from '@types-app'

class AudioEngineClass {
  private ctx:        AudioContext | null = null
  private masterGain: GainNode | null = null
  private ambient:    AmbientLayer | null = null
  private initialized = false
  private unlocked    = false
  private readonly cleanupFns: Array<() => void> = []

  // ─── Public API ───────────────────────────────────────────────────────────

  init(): void {
    if (this.initialized || typeof window === 'undefined') return

    // Check reduced motion preference — skip audio entirely
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      this.initialized = true
      return
    }

    // AudioContext created suspended (browser policy — must resume on gesture)
    this.ctx        = new AudioContext()
    this.masterGain = this.ctx.createGain()
    this.masterGain.gain.setValueAtTime(0, this.ctx.currentTime)
    this.masterGain.connect(this.ctx.destination)

    this.ambient = new AmbientLayer(this.ctx, this.masterGain)

    // Resume on first user interaction (iOS/Android requirement)
    const unsubInteraction = eventBus.on('user:first:interaction', () => {
      void this.unlock()
    })

    // Crossfade to new scene ambient on transition complete
    const unsubScene = eventBus.on('scene:transition:complete', ({ scene }) => {
      if (this.unlocked) this.crossfadeTo(scene)
    })

    // Reduce audio complexity under FPS pressure
    const unsubFPS = eventBus.on('performance:fps:drop', () => {
      this.ambient?.reduceComplexity()
    })

    // External mute/unmute control
    const unsubMute = eventBus.on('audio:muted', ({ muted }) => {
      this.setMuted(muted)
    })

    this.cleanupFns.push(unsubInteraction, unsubScene, unsubFPS, unsubMute)
    this.initialized = true
    eventBus.emit('system:ready', { systemName: 'AudioEngine' })
  }

  destroy(): void {
    if (!this.initialized) return
    this.ambient?.destroy()
    this.ambient = null
    if (this.ctx && this.ctx.state !== 'closed') {
      void this.ctx.close()
    }
    this.ctx        = null
    this.masterGain = null
    this.unlocked   = false
    this.cleanupFns.forEach((fn) => fn())
    this.cleanupFns.length = 0
    this.initialized = false
    eventBus.emit('system:destroyed', { systemName: 'AudioEngine' })
  }

  setMuted(muted: boolean): void {
    if (!this.masterGain || !this.ctx) return
    const target = muted ? 0 : 1
    this.masterGain.gain.linearRampToValueAtTime(target, this.ctx.currentTime + 0.8)
  }

  get isActive(): boolean { return this.initialized && this.unlocked }

  // ─── Private ──────────────────────────────────────────────────────────────

  private async unlock(): Promise<void> {
    if (!this.ctx || this.unlocked) return
    try {
      if (this.ctx.state === 'suspended') await this.ctx.resume()
      if (this.ctx.state !== 'running') return

      this.unlocked = true

      // Fade in master gain
      const now = this.ctx.currentTime
      this.masterGain?.gain.linearRampToValueAtTime(1.0, now + 3.0)

      // Start ambient for the current scene
      const currentScene = useSceneStore.getState().currentScene
      this.crossfadeTo(currentScene)

      eventBus.emit('audio:unlocked', {})
    } catch {
      // AudioContext resume can fail silently — no error surfaced to user
    }
  }

  private crossfadeTo(scene: SceneId): void {
    if (!this.ctx || !this.ambient || this.ctx.state !== 'running') return
    // Skip audio if device is LOW tier (no audio budget allocated)
    if (usePerformanceStore.getState().deviceTier === 'LOW') return
    this.ambient.transitionTo(scene)
  }
}

export const AudioEngine = new AudioEngineClass()
