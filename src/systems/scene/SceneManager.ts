// SceneManager — FSM controller for the 4 cinematic scenes.
// Subscribes to: scroll:scene:threshold
// Emits: scene:transition:start, scene:transition:complete, scene:locked
// Writes: useSceneStore (setScene, pushHistory, setLocked, setTransitionState)
// Lock prevents double-transitions during the 900ms crossfade window.

import { eventBus }      from '@lib/event-bus'
import { useSceneStore } from '@store/scene.store'
import { SCENE_SEQUENCE, TRANSITION_CONFIG } from '@config/scenes.config'
import type { SceneId }  from '@types-app'

class SceneManagerClass {
  private initialized     = false
  private transitionTimer: ReturnType<typeof setTimeout> | null = null
  private readonly cleanupFns: Array<() => void> = []

  init(): void {
    if (this.initialized) return

    const unsubThreshold = eventBus.on('scroll:scene:threshold', ({ scene, direction }) => {
      this.handleThreshold(scene, direction)
    })

    this.cleanupFns.push(unsubThreshold)
    this.initialized = true
    eventBus.emit('system:ready', { systemName: 'SceneManager' })
  }

  destroy(): void {
    if (!this.initialized) return
    if (this.transitionTimer !== null) {
      clearTimeout(this.transitionTimer)
      this.transitionTimer = null
    }
    this.cleanupFns.forEach((fn) => fn())
    this.cleanupFns.length = 0
    this.initialized = false
    eventBus.emit('system:destroyed', { systemName: 'SceneManager' })
  }

  get isReady(): boolean { return this.initialized }

  // ─── Private ──────────────────────────────────────────────────────────────

  private handleThreshold(nextScene: SceneId, _direction: 'forward' | 'backward'): void {
    const store = useSceneStore.getState()
    if (store.isLocked) return

    const from = store.currentScene
    if (from === nextScene) return

    // FSM guard: only allow adjacent scene transitions
    const fromIdx = (SCENE_SEQUENCE as readonly SceneId[]).indexOf(from)
    const toIdx   = (SCENE_SEQUENCE as readonly SceneId[]).indexOf(nextScene)
    if (Math.abs(fromIdx - toIdx) !== 1) return

    this.startTransition(from, nextScene)
  }

  private startTransition(from: SceneId, to: SceneId): void {
    const store = useSceneStore.getState()

    store.setLocked(true)
    store.setTransitionState('transitioning')

    eventBus.emit('scene:transition:start', { from, to, timestamp: Date.now() })
    eventBus.emit('scene:locked', { locked: true })

    this.transitionTimer = setTimeout(() => {
      const s = useSceneStore.getState()
      s.setScene(to)
      s.pushHistory(to)
      s.setTransitionState('complete')
      s.setLocked(false)

      eventBus.emit('scene:transition:complete', {
        scene:    to,
        duration: TRANSITION_CONFIG.lockDurationMs,
      })
      eventBus.emit('scene:locked', { locked: false })

      this.transitionTimer = null
    }, TRANSITION_CONFIG.lockDurationMs)
  }
}

export const SceneManager = new SceneManagerClass()
