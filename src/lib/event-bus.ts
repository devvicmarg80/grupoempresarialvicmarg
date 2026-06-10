// ─── VICMARG EventBus ───────────────────────────────────────────────────────
// Typed publish/subscribe system. The ONLY communication channel between:
//   SceneManager, VideoEngine, OverlaySystem, TransitionEngine,
//   AnimationOrchestrator, and PerformanceLayer.
//
// Rules:
//  1. Systems EMIT events — they never import each other
//  2. Systems LISTEN to events from other systems
//  3. React components use hooks that wrap EventBus subscriptions
//  4. EventBus is a singleton: import { eventBus } from '@lib/event-bus'
// ───────────────────────────────────────────────────────────────────────────

import type {
  SceneId,
  SceneTransitionState,
  VideoQuality,
  PlaybackState,
  DeviceTier,
  ConnectionType,
  GlassLevel,
} from '@types-app'

// ─── AI Conversation State ────────────────────────────────────────────────────
export type AIConversationState =
  | 'idle'         // Session not started
  | 'initializing' // Acquiring token + connecting
  | 'ready'        // Connected, waiting for user
  | 'listening'    // User is speaking (VAD active)
  | 'thinking'     // LLM processing
  | 'speaking'     // AI is outputting audio
  | 'error'        // Recoverable error
  | 'ended'        // Session ended

// ─── Typed Event Map ─────────────────────────────────────────────────────────
export interface VicmargEventMap {
  // ── Scene Events ──────────────────────────────────────────────────────────
  'scene:transition:start':    { from: SceneId; to: SceneId; timestamp: number }
  'scene:transition:complete': { scene: SceneId; duration: number }
  'scene:transition:error':    { from: SceneId; to: SceneId; error: string }
  'scene:progress:update':     { scene: SceneId; progress: number }
  'scene:locked':              { locked: boolean }

  // ── Video Events ──────────────────────────────────────────────────────────
  'video:loading':             { sceneId: string }
  'video:playing':             { sceneId: string; currentTime: number }
  'video:paused':              { sceneId: string }
  'video:buffering':           { sceneId: string; bufferProgress: number }
  'video:stalled':             { sceneId: string; stallCount: number }
  'video:ended':               { sceneId: string }
  'video:quality:changed':     { sceneId: string; from: VideoQuality; to: VideoQuality }
  'video:preload:start':       { sceneId: string }
  'video:preload:complete':    { sceneId: string }
  'video:preload:aborted':     { sceneId: string; reason: string }
  'video:error':               { sceneId: string; error: string; fatal: boolean }
  'video:state:changed':       { sceneId: string; state: PlaybackState }

  // ── Overlay Events ────────────────────────────────────────────────────────
  'overlay:open':              { overlayId: string; priority: number; sceneId: string }
  'overlay:closed':            { overlayId: string }
  'overlay:dismiss:all':       Record<string, never>
  'overlay:queue:updated':     { queueLength: number }

  // ── Transition Events ─────────────────────────────────────────────────────
  'transition:crossfade:start':    { from: SceneId; to: SceneId }
  'transition:crossfade:complete': { to: SceneId; durationMs: number }

  // ── Scroll Events ─────────────────────────────────────────────────────────
  'scroll:progress':           { progress: number; velocityY: number }
  'scroll:scene:threshold':    { scene: SceneId; direction: 'forward' | 'backward' }

  // ── Animation Events ──────────────────────────────────────────────────────
  'animation:timeline:start':     { timelineId: string; sceneId: SceneId }
  'animation:timeline:complete':  { timelineId: string; sceneId: SceneId }
  'animation:timeline:killed':    { timelineId: string }

  // ── Performance Events ────────────────────────────────────────────────────
  'performance:tier:changed':     { from: DeviceTier; to: DeviceTier }
  'performance:fps:drop':         { fps: number; threshold: number }
  'performance:fps:recovered':    { fps: number }
  'performance:memory:pressure':  { usedBytes: number; limitBytes: number }
  'performance:glass:changed':    { from: GlassLevel; to: GlassLevel }
  'performance:connection':       { type: ConnectionType; downlinkMbps: number | null }
  'performance:detection:complete': { tier: DeviceTier }

  // ── User Events ───────────────────────────────────────────────────────────
  'user:first:interaction':       Record<string, never>
  'user:name:captured':           { name: string }
  'user:journey:advance':         { step: number; scene: SceneId }
  'user:converted':               { scene: SceneId; timestamp: number }
  'user:session:started':         { userId: string }
  'user:session:ended':           Record<string, never>
  // Funnel events
  'user:affiliation:answered':    { isAffiliated: boolean }
  'user:service:selected':        { service: 'educativa' | 'empresarial' }
  'user:registration:submitted':  { name: string; email: string; phone: string }

  // ── AI Events ─────────────────────────────────────────────────────────────
  'ai:receptionist:ready':        { adapter: string }
  'ai:session:start':             { sessionId: string }
  'ai:session:end':               { sessionId: string; durationMs: number; reason: string }
  'ai:state:change':              { state: AIConversationState; sessionId: string }
  'ai:transcript:delta':          { role: 'user' | 'assistant'; text: string; final: boolean }
  'ai:speaking:start':            { sessionId: string }
  'ai:speaking:end':              { sessionId: string }
  'ai:listening:start':           { sessionId: string }
  'ai:listening:end':             { sessionId: string }
  'ai:error':                     { error: string; code: string; sessionId?: string }

  // ── Audio Events ──────────────────────────────────────────────────────────
  'audio:muted':                  { muted: boolean }
  'audio:unlocked':               Record<string, never>

  // ── System Lifecycle ──────────────────────────────────────────────────────
  'system:ready':                 { systemName: string }
  'system:destroyed':             { systemName: string }
  'system:error':                 { systemName: string; error: string }
}

// ─── EventBus Implementation ─────────────────────────────────────────────────

type EventHandler<T> = (payload: T) => void
type UnsubscribeFn = () => void

class TypedEventBus<Events extends object> {
  private readonly listeners = new Map<
    keyof Events,
    Set<EventHandler<Events[keyof Events]>>
  >()

  private debugMode = process.env.NODE_ENV === 'development'

  /**
   * Subscribe to an event.
   * Returns an unsubscribe function for cleanup.
   *
   * @example
   * const unsub = eventBus.on('scene:transition:start', ({ from, to }) => {
   *   console.log(`Transitioning from ${from} to ${to}`)
   * })
   * // Cleanup: unsub()
   */
  on<K extends keyof Events>(
    event: K,
    handler: EventHandler<Events[K]>
  ): UnsubscribeFn {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set())
    }

    const handlers = this.listeners.get(event)!
    handlers.add(handler as EventHandler<Events[keyof Events]>)

    return () => this.off(event, handler)
  }

  /**
   * Subscribe to an event only once.
   * Auto-unsubscribes after first emission.
   */
  once<K extends keyof Events>(
    event: K,
    handler: EventHandler<Events[K]>
  ): UnsubscribeFn {
    const wrapper = (payload: Events[K]) => {
      handler(payload)
      this.off(event, wrapper)
    }
    return this.on(event, wrapper)
  }

  /**
   * Emit an event with a typed payload.
   * Executes all registered handlers synchronously.
   */
  emit<K extends keyof Events>(event: K, payload: Events[K]): void {
    if (this.debugMode) {
      console.debug(`[EventBus] ▶ ${String(event)}`, payload)
    }

    const handlers = this.listeners.get(event)
    if (!handlers?.size) return

    handlers.forEach((handler) => {
      try {
        (handler as EventHandler<Events[K]>)(payload)
      } catch (error) {
        console.error(
          `[EventBus] Handler error for event "${String(event)}":`,
          error
        )
      }
    })
  }

  /**
   * Unsubscribe a specific handler from an event.
   */
  off<K extends keyof Events>(
    event: K,
    handler: EventHandler<Events[K]>
  ): void {
    this.listeners.get(event)?.delete(
      handler as EventHandler<Events[keyof Events]>
    )
  }

  /**
   * Remove all handlers for an event, or ALL handlers if no event specified.
   */
  clear(event?: keyof Events): void {
    if (event) {
      this.listeners.get(event)?.clear()
    } else {
      this.listeners.clear()
    }
  }

  /**
   * Get handler count for an event (useful for debugging).
   */
  listenerCount(event: keyof Events): number {
    return this.listeners.get(event)?.size ?? 0
  }

  /**
   * Enable/disable debug logging.
   */
  setDebugMode(enabled: boolean): void {
    this.debugMode = enabled
  }
}

// ─── Singleton Export ─────────────────────────────────────────────────────────
// This is the SINGLE instance used by all systems.
// Import: import { eventBus } from '@lib/event-bus'
export const eventBus = new TypedEventBus<VicmargEventMap>()

// ─── Type helper for external use ────────────────────────────────────────────
export type VicmargEventBus = typeof eventBus
export type VicmargEvent = keyof VicmargEventMap
export type VicmargEventPayload<K extends VicmargEvent> = VicmargEventMap[K]
