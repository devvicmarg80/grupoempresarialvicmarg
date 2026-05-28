// TTSProvider — abstract voice synthesis interface.
// Allows swapping OpenAI TTS ↔ ElevenLabs ↔ browser speech without changing callers.
// Used by SessionOrchestrator to play AI responses aloud.
// Phase 6: NullTTSProvider is default (text-only mode — audio enabled via env vars).

export interface TTSSpeakOptions {
  signal?:   AbortSignal
  onStart?:  () => void
  onEnd?:    () => void
  onError?:  (err: Error) => void
}

export interface TTSProvider {
  readonly name:         string
  readonly isConfigured: boolean
  speak(text: string, options?: TTSSpeakOptions): Promise<void>
  cancel(): void
  destroy(): void
}

// ─── Null Provider (text-only fallback) ─────────────────────────────────────

export class NullTTSProvider implements TTSProvider {
  readonly name         = 'none'
  readonly isConfigured = false

  speak(_text: string, options?: TTSSpeakOptions): Promise<void> {
    options?.onStart?.()
    setTimeout(() => options?.onEnd?.(), 0)
    return Promise.resolve()
  }

  cancel(): void  { /* noop */ }
  destroy(): void { /* noop */ }
}

// ─── OpenAI TTS (via /api/ai/tts proxy) ─────────────────────────────────────

export class OpenAITTSProvider implements TTSProvider {
  readonly name         = 'openai'
  readonly isConfigured = true
  private currentAudio: HTMLAudioElement | null = null

  async speak(text: string, options?: TTSSpeakOptions): Promise<void> {
    if (options?.signal?.aborted) return

    try {
      const res = await fetch('/api/ai/tts', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ text, voice: 'alloy' }),
        ...(options?.signal ? { signal: options.signal } : {}),
      })

      if (!res.ok) throw new Error(`TTS failed: ${res.status}`)

      const blob  = await res.blob()
      const url   = URL.createObjectURL(blob)
      const audio = new Audio(url)
      this.currentAudio = audio

      options?.onStart?.()

      await new Promise<void>((resolve, reject) => {
        audio.onended  = () => { URL.revokeObjectURL(url); resolve() }
        audio.onerror  = () => { URL.revokeObjectURL(url); reject(new Error('Audio playback failed')) }
        void audio.play()
      })

      options?.onEnd?.()
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') return
      options?.onError?.(err instanceof Error ? err : new Error(String(err)))
    } finally {
      this.currentAudio = null
    }
  }

  cancel(): void {
    if (this.currentAudio) {
      this.currentAudio.pause()
      this.currentAudio = null
    }
  }

  destroy(): void { this.cancel() }
}

// ─── ElevenLabs TTS (via /api/ai/tts proxy with provider=elevenlabs) ────────

export class ElevenLabsTTSProvider implements TTSProvider {
  readonly name:         string
  readonly isConfigured: boolean
  private readonly voiceId: string
  private currentAudio: HTMLAudioElement | null = null

  constructor(voiceId: string) {
    this.voiceId      = voiceId
    this.name         = 'elevenlabs'
    this.isConfigured = voiceId.length > 0
  }

  async speak(text: string, options?: TTSSpeakOptions): Promise<void> {
    if (options?.signal?.aborted || !this.isConfigured) return

    try {
      const res = await fetch('/api/ai/tts', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ text, provider: 'elevenlabs', voiceId: this.voiceId }),
        ...(options?.signal ? { signal: options.signal } : {}),
      })

      if (!res.ok) throw new Error(`ElevenLabs TTS failed: ${res.status}`)

      const blob  = await res.blob()
      const url   = URL.createObjectURL(blob)
      const audio = new Audio(url)
      this.currentAudio = audio

      options?.onStart?.()

      await new Promise<void>((resolve, reject) => {
        audio.onended = () => { URL.revokeObjectURL(url); resolve() }
        audio.onerror = () => { URL.revokeObjectURL(url); reject(new Error('Audio playback failed')) }
        void audio.play()
      })

      options?.onEnd?.()
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') return
      options?.onError?.(err instanceof Error ? err : new Error(String(err)))
    } finally {
      this.currentAudio = null
    }
  }

  cancel(): void {
    if (this.currentAudio) { this.currentAudio.pause(); this.currentAudio = null }
  }

  destroy(): void { this.cancel() }
}

// ─── Factory — resolves correct provider from env vars ───────────────────────

export function createTTSProvider(): TTSProvider {
  if (typeof process === 'undefined') return new NullTTSProvider()

  const elVoiceId = process.env.NEXT_PUBLIC_ELEVENLABS_VOICE_ID
  if (elVoiceId) return new ElevenLabsTTSProvider(elVoiceId)

  const openaiKey = process.env.OPENAI_API_KEY  // server-only - won't reach client
  if (openaiKey || process.env.NEXT_PUBLIC_AI_TTS_ENABLED === 'true') {
    return new OpenAITTSProvider()
  }

  return new NullTTSProvider()
}
