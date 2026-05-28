// AI Conversation State — types for the VICMARG AI Receptionist session.
// Imported by: SessionOrchestrator, AIReceptionistOverlay, ai.store.

import type { AIConversationState } from '@lib/event-bus'
export type { AIConversationState }

export interface TranscriptEntry {
  id:        string
  role:      'user' | 'assistant'
  text:      string
  final:     boolean
  timestamp: number
}

export interface AISessionConfig {
  model:        string  // 'gpt-4o-realtime-preview-2024-12-17'
  voice:        string  // 'alloy' | 'echo' | 'shimmer' | etc.
  instructions: string  // System prompt (VICMARG persona)
  maxDurationMs: number // Auto-end session after this time
  silenceTimeoutMs: number // End after sustained silence
}

export const DEFAULT_SESSION_CONFIG: AISessionConfig = {
  model:    'gpt-4o-realtime-preview-2024-12-17',
  voice:    'alloy',
  instructions: `Eres el Asistente Ejecutivo de Grupo Empresarial VICMARG, una empresa colombiana de alto perfil con operaciones en construcción, inmobiliaria, industrial e inversiones.

Tu comunicación es:
- Formal, precisa y ejecutiva en español colombiano (usted)
- Minimalista: pocas palabras, alto impacto
- Cálida pero profesional — jamás informal ni genérica
- Orientada a guiar al visitante a través del ecosistema VICMARG
- Enfocada en calificar interés y agendar reuniones

Reglas:
- Nunca seas verbose ni repitas información
- Capta el nombre del visitante en los primeros 15 segundos
- Presenta las unidades de negocio con elegancia ejecutiva
- Guía hacia una reunión o exploración más profunda del portafolio
- Si el visitante expresa interés en inversión, construcción o inmobiliaria: profundiza
- Mantén cada respuesta bajo 40 palabras cuando sea posible`,
  maxDurationMs:    300_000,  // 5 minutes max session
  silenceTimeoutMs:  30_000,  // 30s silence → auto-end
}

export interface RealtimeSessionToken {
  clientSecret: {
    value:     string
    expiresAt: number
  }
}

export type RTClientEvent =
  | { type: 'session.created';                   session: object }
  | { type: 'session.updated';                   session: object }
  | { type: 'input_audio_buffer.speech_started'; }
  | { type: 'input_audio_buffer.speech_stopped'; }
  | { type: 'conversation.item.input_audio_transcription.completed'; transcript: string }
  | { type: 'response.text.delta';               delta: string; item_id: string }
  | { type: 'response.audio.delta';              delta: string }  // base64 PCM16
  | { type: 'response.done';                     }
  | { type: 'error';                             error: { message: string; code?: string } }
