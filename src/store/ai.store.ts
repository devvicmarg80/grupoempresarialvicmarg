// AI store — session state for VICMARG AI Receptionist.
// Written by SessionOrchestrator. Read by AIReceptionistOverlay.
// ────────────────────────────────────────────────────────────────────────────

import { create }                  from 'zustand'
import { subscribeWithSelector }   from 'zustand/middleware'
import type { AIConversationState } from '@lib/event-bus'
import type { TranscriptEntry }     from '@lib/ai/conversation-state'

// ─── Store shape ──────────────────────────────────────────────────────────────

interface AIState {
  conversationState: AIConversationState
  sessionId:         string | null
  isConnected:       boolean
  isMuted:           boolean
  isEnabled:         boolean   // env var gate
  transcript:        TranscriptEntry[]
  error:             string | null
  sessionStartedAt:  number | null
  latencyMs:         number | null
}

interface AIActions {
  setConversationState: (state: AIConversationState) => void
  setSessionId:         (id: string | null) => void
  setConnected:         (connected: boolean) => void
  setMuted:             (muted: boolean) => void
  setEnabled:           (enabled: boolean) => void
  addTranscriptEntry:   (entry: TranscriptEntry) => void
  updateLastEntry:      (id: string, text: string, final: boolean) => void
  setError:             (error: string | null) => void
  setLatency:           (ms: number) => void
  reset:                () => void
}

type AIStore = AIState & AIActions

const INITIAL_STATE: AIState = {
  conversationState: 'idle',
  sessionId:         null,
  isConnected:       false,
  isMuted:           false,
  isEnabled:         false,
  transcript:        [],
  error:             null,
  sessionStartedAt:  null,
  latencyMs:         null,
}

export const useAIStore = create<AIStore>()(
  subscribeWithSelector((set) => ({
    ...INITIAL_STATE,

    setConversationState: (conversationState) => set({ conversationState }),
    setSessionId:         (sessionId) =>         set({ sessionId }),
    setConnected:         (isConnected) =>        set({ isConnected }),
    setMuted:             (isMuted) =>            set({ isMuted }),
    setEnabled:           (isEnabled) =>          set({ isEnabled }),
    setError:             (error) =>              set({ error }),
    setLatency:           (latencyMs) =>          set({ latencyMs }),

    addTranscriptEntry: (entry) =>
      set((s) => ({ transcript: [...s.transcript.slice(-19), entry] })),

    updateLastEntry: (id, text, final) =>
      set((s) => ({
        transcript: s.transcript.map((e) =>
          e.id === id ? { ...e, text, final } : e
        ),
      })),

    reset: () => set({ ...INITIAL_STATE }),
  }))
)

// ─── Selectors ─────────────────────────────────────────────────────────────
export const selectConversationState = (s: AIStore) => s.conversationState
export const selectAISessionId       = (s: AIStore) => s.sessionId
export const selectIsConnected       = (s: AIStore) => s.isConnected
export const selectIsMuted           = (s: AIStore) => s.isMuted
export const selectAIEnabled         = (s: AIStore) => s.isEnabled
export const selectTranscript        = (s: AIStore) => s.transcript
export const selectAIError           = (s: AIStore) => s.error
export const selectAILatency         = (s: AIStore) => s.latencyMs
