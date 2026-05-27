// AnimationOrchestrator — per-scene GSAP context registry.
// Each scene gets an isolated gsap.context(). Reverted on scene exit.
// Phase 3: empty contexts (container pattern). Phase 4 adds scene animations.
// Rule: ONLY this system creates GSAP timelines. Components never call gsap directly.

import gsap          from 'gsap'
import { eventBus }  from '@lib/event-bus'
import { SCENE_SEQUENCE } from '@config/scenes.config'
import type { SceneId }   from '@types-app'

type GSAPContext = ReturnType<typeof gsap.context>

class AnimationOrchestratorClass {
  private readonly contexts  = new Map<SceneId, GSAPContext>()
  private initialized        = false
  private readonly cleanupFns: Array<() => void> = []

  init(): void {
    if (this.initialized) return

    // Seed a context for the initial scene
    this.buildContext('ARRIVAL')

    const unsubStart = eventBus.on('scene:transition:start', ({ to }) => {
      this.buildContext(to)
    })

    const unsubComplete = eventBus.on('scene:transition:complete', ({ scene }) => {
      // Revert all non-active scene contexts to free GSAP memory
      ;(SCENE_SEQUENCE as readonly SceneId[]).forEach((sceneId) => {
        if (sceneId !== scene) this.revertContext(sceneId)
      })
    })

    this.cleanupFns.push(unsubStart, unsubComplete)
    this.initialized = true
    eventBus.emit('system:ready', { systemName: 'AnimationOrchestrator' })
  }

  destroy(): void {
    if (!this.initialized) return
    this.contexts.forEach((ctx) => ctx.revert())
    this.contexts.clear()
    this.cleanupFns.forEach((fn) => fn())
    this.cleanupFns.length = 0
    this.initialized = false
    eventBus.emit('system:destroyed', { systemName: 'AnimationOrchestrator' })
  }

  get isReady(): boolean { return this.initialized }

  // ─── Private ──────────────────────────────────────────────────────────────

  private buildContext(sceneId: SceneId): void {
    this.revertContext(sceneId)

    // Phase 3: empty context — scene-specific timelines added in Phase 4.
    // gsap.context() isolates all GSAP animations created inside;
    // ctx.revert() kills them all cleanly without affecting other scenes.
    const ctx = gsap.context(() => {
      // Phase 4 will populate per-scene tweens here
    })

    this.contexts.set(sceneId, ctx)
    eventBus.emit('animation:timeline:start', { timelineId: `${sceneId}_ctx`, sceneId })
  }

  private revertContext(sceneId: SceneId): void {
    const ctx = this.contexts.get(sceneId)
    if (!ctx) return
    ctx.revert()
    this.contexts.delete(sceneId)
    eventBus.emit('animation:timeline:killed', { timelineId: `${sceneId}_ctx` })
  }
}

export const AnimationOrchestrator = new AnimationOrchestratorClass()
