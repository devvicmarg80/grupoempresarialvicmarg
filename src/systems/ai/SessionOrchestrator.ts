// SessionOrchestrator — AI receptionist session lifecycle manager.
// Owns: connection, state transitions, transcript, TTS playback, timeouts.
// Architecture: EventBus-only communication. No component imports.
// Gate: only activates when NEXT_PUBLIC_AI_ENABLED === 'true' AND session configured.
// init() in SystemProvider (boot order: after OverlaySystem).

import { eventBus }             from '@lib/event-bus'
import { useAIStore }            from '@store/ai.store'
import { useOverlayStore }       from '@store/overlay.store'
import { useUserStore }          from '@store/user.store'
import { RealtimeClient }        from '@lib/ai/realtime-client'
import { createTTSProvider }     from '@lib/ai/tts-provider'
import type { TTSProvider }       from '@lib/ai/tts-provider'
import type { RTClientEvent }     from '@lib/ai/conversation-state'
import type { AIConversationState } from '@lib/event-bus'
import {
  DEFAULT_SESSION_CONFIG,
} from '@lib/ai/conversation-state'

const AI_OVERLAY_ID = 'ai-receptionist'

class SessionOrchestratorClass {
  private client:      RealtimeClient | null = null
  private tts:         TTSProvider | null = null
  private initialized  = false
  private sessionId    = ''
  private sessionStart = 0
  private silenceTimer: ReturnType<typeof setTimeout> | null = null
  private maxTimer:     ReturnType<typeof setTimeout> | null = null
  private ttsAbortCtrl: AbortController | null = null
  private readonly cleanupFns: Array<() => void> = []

  // ─── Public API ───────────────────────────────────────────────────────────

  init(): void {
    if (this.initialized || typeof window === 'undefined') return

    const enabled = process.env.NEXT_PUBLIC_AI_ENABLED === 'true'
    useAIStore.getState().setEnabled(enabled)

    if (!enabled) {
      this.initialized = true
      return
    }

    this.tts = createTTSProvider()

    // Open AI overlay when entering GREETING scene (if AI is configured)
    const unsubScene = eventBus.on('scene:transition:complete', ({ scene }) => {
      if (scene === 'GREETING') void this.startSession()
      if (scene !== 'GREETING') void this.endSession('scene_change')
    })

    // Mute/unmute propagation
    const unsubMute = eventBus.on('audio:muted', ({ muted }) => {
      useAIStore.getState().setMuted(muted)
    })

    this.cleanupFns.push(unsubScene, unsubMute)
    this.initialized = true
    eventBus.emit('system:ready', { systemName: 'SessionOrchestrator' })
  }

  destroy(): void {
    if (!this.initialized) return
    void this.endSession('system_destroy')
    this.cleanupFns.forEach((fn) => fn())
    this.cleanupFns.length = 0
    this.tts?.destroy()
    this.tts = null
    this.initialized = false
    eventBus.emit('system:destroyed', { systemName: 'SessionOrchestrator' })
  }

  // ─── Session Lifecycle ────────────────────────────────────────────────────

  private async startSession(): Promise<void> {
    if (this.client?.isOpen) return
    this.transition('initializing')

    try {
      this.client = new RealtimeClient(DEFAULT_SESSION_CONFIG)
      this.sessionId    = await this.client.connect()
      this.sessionStart = Date.now()

      const unsubRT = this.client.onEvent((event) => this.handleRTEvent(event))
      this.cleanupFns.push(unsubRT)

      this.transition('ready')
      eventBus.emit('ai:session:start', { sessionId: this.sessionId })

      // Open AI overlay — priority 5 (replaces text form via priority queue)
      useOverlayStore.getState().openOverlay({
        id:                   AI_OVERLAY_ID,
        priority:             5,
        sceneId:              'GREETING',
        dismissible:          true,
        dismissOnSceneChange: true,
        glassMaterial:        'dark',
        position:             { vertical: 'center', horizontal: 'center' },
        backdropClose:        false,
      })
      eventBus.emit('overlay:open', {
        overlayId: AI_OVERLAY_ID, priority: 5, sceneId: 'GREETING',
      })

      // Start max-session timer
      this.maxTimer = setTimeout(() => {
        void this.endSession('timeout')
      }, DEFAULT_SESSION_CONFIG.maxDurationMs)

    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Connection failed'
      this.transition('error')
      eventBus.emit('ai:error', { error: msg, code: 'connection_failed', sessionId: this.sessionId })
      useAIStore.getState().setError(msg)
    }
  }

  async endSession(reason: string): Promise<void> {
    if (!this.client && useAIStore.getState().conversationState === 'idle') return

    this.clearTimers()
    this.ttsAbortCtrl?.abort()
    this.client?.close()
    this.client = null

    const durationMs = this.sessionStart > 0 ? Date.now() - this.sessionStart : 0
    this.sessionStart = 0

    eventBus.emit('ai:session:end', {
      sessionId: this.sessionId, durationMs, reason,
    })
    useOverlayStore.getState().closeOverlay(AI_OVERLAY_ID)
    this.transition('ended')
    useAIStore.getState().reset()
  }

  // ─── Realtime Event Handler ───────────────────────────────────────────────

  private handleRTEvent(event: RTClientEvent): void {
    switch (event.type) {

      case 'input_audio_buffer.speech_started': {
        this.ttsAbortCtrl?.abort()  // Interrupt current AI speech (barge-in)
        this.transition('listening')
        this.resetSilenceTimer()
        eventBus.emit('ai:listening:start', { sessionId: this.sessionId })
        break
      }

      case 'input_audio_buffer.speech_stopped': {
        this.transition('thinking')
        eventBus.emit('ai:listening:end', { sessionId: this.sessionId })
        break
      }

      case 'conversation.item.input_audio_transcription.completed': {
        const entry = {
          id:        `u-${Date.now()}`,
          role:      'user' as const,
          text:      event.transcript,
          final:     true,
          timestamp: Date.now(),
        }
        useAIStore.getState().addTranscriptEntry(entry)
        eventBus.emit('ai:transcript:delta', {
          role: 'user', text: event.transcript, final: true,
        })

        // Capture visitor name from first meaningful utterance
        const name = this.extractName(event.transcript)
        if (name) useUserStore.getState().setVisitorName(name)
        break
      }

      case 'response.text.delta': {
        this.handleTextDelta(event.item_id, event.delta)
        break
      }

      case 'response.done': {
        this.transition('ready')
        eventBus.emit('ai:speaking:end', { sessionId: this.sessionId })
        this.resetSilenceTimer()
        break
      }

      case 'error': {
        const msg = event.error.message
        this.transition('error')
        eventBus.emit('ai:error', {
          error: msg, code: event.error.code ?? 'rt_error', sessionId: this.sessionId,
        })
        useAIStore.getState().setError(msg)
        break
      }
    }
  }

  private handleTextDelta(itemId: string, delta: string): void {
    const store   = useAIStore.getState()
    const existing = store.transcript.find((e) => e.id === itemId)
    if (existing) {
      store.updateLastEntry(itemId, existing.text + delta, false)
    } else {
      store.addTranscriptEntry({
        id:        itemId,
        role:      'assistant',
        text:      delta,
        final:     false,
        timestamp: Date.now(),
      })
      this.transition('speaking')
      eventBus.emit('ai:speaking:start', { sessionId: this.sessionId })
    }
    eventBus.emit('ai:transcript:delta', { role: 'assistant', text: delta, final: false })
  }

  // ─── Helpers ──────────────────────────────────────────────────────────────

  private transition(state: AIConversationState): void {
    useAIStore.getState().setConversationState(state)
    eventBus.emit('ai:state:change', { state, sessionId: this.sessionId })
  }

  private resetSilenceTimer(): void {
    if (this.silenceTimer !== null) clearTimeout(this.silenceTimer)
    this.silenceTimer = setTimeout(() => {
      void this.endSession('silence_timeout')
    }, DEFAULT_SESSION_CONFIG.silenceTimeoutMs)
  }

  private clearTimers(): void {
    if (this.silenceTimer !== null) { clearTimeout(this.silenceTimer); this.silenceTimer = null }
    if (this.maxTimer     !== null) { clearTimeout(this.maxTimer);     this.maxTimer     = null }
  }

  private extractName(transcript: string): string | null {
    // Heuristic: look for "me llamo X", "soy X", "mi nombre es X"
    const patterns = [
      /me llamo\s+([A-ZÁÉÍÓÚÑ][a-záéíóúñ]+)/i,
      /soy\s+([A-ZÁÉÍÓÚÑ][a-záéíóúñ]+)/i,
      /mi nombre es\s+([A-ZÁÉÍÓÚÑ][a-záéíóúñ]+)/i,
      /^([A-ZÁÉÍÓÚÑ][a-záéíóúñ]+)\s*$/,
    ]
    for (const pattern of patterns) {
      const match = transcript.match(pattern)
      if (match?.[1]) return match[1]
    }
    return null
  }
}

export const SessionOrchestrator = new SessionOrchestratorClass()
