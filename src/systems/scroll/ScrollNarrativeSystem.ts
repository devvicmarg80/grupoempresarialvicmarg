// ScrollNarrativeSystem — window scroll → scene progress.
// Emits: scroll:progress, scroll:scene:threshold, scene:progress:update
// Writes: useSceneStore.setProgress()
// Architecture: uses window scroll (body is 400vh tall, all visuals are fixed).

import { eventBus }      from '@lib/event-bus'
import { useSceneStore } from '@store/scene.store'
import { SCENE_SEQUENCE } from '@config/scenes.config'
import type { SceneId }  from '@types-app'

const TOTAL_SCENES = 4

class ScrollNarrativeSystemClass {
  private prevSceneIndex  = 0
  private lastScrollY     = 0
  private lastScrollTime  = 0
  private initialized     = false
  private readonly cleanupFns: Array<() => void> = []

  init(): void {
    if (this.initialized || typeof window === 'undefined') return

    const handleScroll = (): void => { this.onScroll() }
    window.addEventListener('scroll', handleScroll, { passive: true })
    this.cleanupFns.push(() => window.removeEventListener('scroll', handleScroll))

    this.initialized = true
    eventBus.emit('system:ready', { systemName: 'ScrollNarrativeSystem' })
  }

  destroy(): void {
    if (!this.initialized) return
    this.cleanupFns.forEach((fn) => fn())
    this.cleanupFns.length = 0
    this.prevSceneIndex = 0
    this.initialized    = false
    eventBus.emit('system:destroyed', { systemName: 'ScrollNarrativeSystem' })
  }

  get isReady(): boolean { return this.initialized }

  // ─── Private ──────────────────────────────────────────────────────────────

  private onScroll(): void {
    const scrollY      = window.scrollY
    const scrollHeight = document.documentElement.scrollHeight - window.innerHeight
    if (scrollHeight <= 0) return

    const now       = performance.now()
    const deltaY    = scrollY - this.lastScrollY
    const deltaT    = now - this.lastScrollTime
    const velocityY = deltaT > 0 ? (deltaY / deltaT) * 1000 : 0

    this.lastScrollY    = scrollY
    this.lastScrollTime = now

    const progress      = Math.max(0, Math.min(1, scrollY / scrollHeight))
    const sceneIndex    = Math.min(Math.floor(progress * TOTAL_SCENES), TOTAL_SCENES - 1)
    const sceneProgress = Math.max(0, Math.min(1, (progress * TOTAL_SCENES) - sceneIndex))
    const sceneId       = SCENE_SEQUENCE[sceneIndex] as SceneId | undefined

    if (!sceneId) return

    eventBus.emit('scroll:progress', { progress, velocityY })
    useSceneStore.getState().setProgress(sceneProgress)
    eventBus.emit('scene:progress:update', { scene: sceneId, progress: sceneProgress })

    if (sceneIndex !== this.prevSceneIndex) {
      const direction = sceneIndex > this.prevSceneIndex ? 'forward' : 'backward'
      this.prevSceneIndex = sceneIndex
      eventBus.emit('scroll:scene:threshold', { scene: sceneId, direction })
    }
  }
}

export const ScrollNarrativeSystem = new ScrollNarrativeSystemClass()
