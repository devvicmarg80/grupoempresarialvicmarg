// OverlaySystem — reads SCENES_CONFIG.overlayTriggers, opens overlays at correct progress.
// Subscribes to: scene:progress:update, scene:transition:start
// Writes to: useOverlayStore (openOverlay, closeOverlay)
// Each trigger fires once per session (firedTriggers Set). Resets on scene revisit only
// if the user has navigated backward and the trigger was dismissOnSceneChange.

import { eventBus }       from '@lib/event-bus'
import { useOverlayStore } from '@store/overlay.store'
import { SCENES_CONFIG }  from '@config/scenes.config'
import type { SceneId, OverlayPriority } from '@types-app'

class OverlaySystemClass {
  private readonly firedTriggers = new Set<string>()
  private initialized            = false
  private readonly cleanupFns: Array<() => void> = []

  init(): void {
    if (this.initialized) return

    const unsubProgress = eventBus.on('scene:progress:update', ({ scene, progress }) => {
      this.checkTriggers(scene, progress)
    })

    const unsubTransition = eventBus.on('scene:transition:start', ({ from }) => {
      this.dismissSceneOverlays(from)
    })

    this.cleanupFns.push(unsubProgress, unsubTransition)
    this.initialized = true
    eventBus.emit('system:ready', { systemName: 'OverlaySystem' })
  }

  destroy(): void {
    if (!this.initialized) return
    this.firedTriggers.clear()
    this.cleanupFns.forEach((fn) => fn())
    this.cleanupFns.length = 0
    this.initialized = false
    eventBus.emit('system:destroyed', { systemName: 'OverlaySystem' })
  }

  get isReady(): boolean { return this.initialized }

  // ─── Private ──────────────────────────────────────────────────────────────

  private checkTriggers(scene: SceneId, progress: number): void {
    const config = SCENES_CONFIG[scene]
    if (!config) return

    for (const trigger of config.overlayTriggers) {
      const key = `${scene}:${trigger.overlayId}`
      if (this.firedTriggers.has(key)) continue
      if (progress < trigger.triggerAtProgress) continue

      this.firedTriggers.add(key)

      useOverlayStore.getState().openOverlay({
        id:                   trigger.overlayId,
        priority:             trigger.priority as OverlayPriority,
        sceneId:              scene,
        dismissible:          true,
        dismissOnSceneChange: trigger.dismissOnSceneChange,
        glassMaterial:        'dark',
        position:             { vertical: 'center', horizontal: 'center' },
        backdropClose:        true,
      })

      eventBus.emit('overlay:open', {
        overlayId: trigger.overlayId,
        priority:  trigger.priority,
        sceneId:   scene,
      })
    }
  }

  private dismissSceneOverlays(scene: SceneId): void {
    const { activeOverlays } = useOverlayStore.getState()
    activeOverlays
      .filter((o) => o.sceneId === scene && o.dismissOnSceneChange)
      .forEach((o) => {
        useOverlayStore.getState().closeOverlay(o.id)
        eventBus.emit('overlay:closed', { overlayId: o.id })
      })
  }
}

export const OverlaySystem = new OverlaySystemClass()
