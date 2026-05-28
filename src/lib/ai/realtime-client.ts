// RealtimeClient — OpenAI Realtime API WebSocket wrapper.
// Handles: connect, session config, audio streaming, response streaming, reconnect.
// Authentication: ephemeral token from /api/ai/session (never exposes main API key).
// Used exclusively by SessionOrchestrator.

import type { RTClientEvent }    from './conversation-state'
import type { AISessionConfig }  from './conversation-state'

type RTHandler = (event: RTClientEvent) => void

export class RealtimeClient {
  private ws:          WebSocket | null = null
  private handlers:    Set<RTHandler> = new Set()
  private config:      AISessionConfig
  private sessionId:   string | null = null
  private reconnecting = false
  private closed       = false
  private pingTimer:   ReturnType<typeof setInterval> | null = null

  constructor(config: AISessionConfig) {
    this.config = config
  }

  async connect(): Promise<string> {
    if (this.ws?.readyState === WebSocket.OPEN) return this.sessionId ?? ''

    // Acquire ephemeral token from our server route
    const tokenRes = await fetch('/api/ai/session', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ model: this.config.model }),
    })

    if (!tokenRes.ok) {
      throw new Error(`Session token failed: ${tokenRes.status}`)
    }

    const { client_secret } = await tokenRes.json() as { client_secret: { value: string } }
    const token = client_secret.value

    await this.openWebSocket(token)
    return this.sessionId ?? ''
  }

  send(message: object): void {
    if (this.ws?.readyState !== WebSocket.OPEN) return
    this.ws.send(JSON.stringify(message))
  }

  sendAudioChunk(base64PCM16: string): void {
    this.send({ type: 'input_audio_buffer.append', audio: base64PCM16 })
  }

  commitAudioBuffer(): void {
    this.send({ type: 'input_audio_buffer.commit' })
  }

  requestTextResponse(): void {
    this.send({
      type:     'response.create',
      response: { modalities: ['text'] },
    })
  }

  requestAudioResponse(): void {
    this.send({
      type:     'response.create',
      response: { modalities: ['text', 'audio'] },
    })
  }

  onEvent(handler: RTHandler): () => void {
    this.handlers.add(handler)
    return () => { this.handlers.delete(handler) }
  }

  close(): void {
    this.closed = true
    if (this.pingTimer !== null) { clearInterval(this.pingTimer); this.pingTimer = null }
    if (this.ws) {
      this.ws.close()
      this.ws = null
    }
    this.handlers.clear()
  }

  get isOpen(): boolean {
    return this.ws?.readyState === WebSocket.OPEN
  }

  // ─── Private ──────────────────────────────────────────────────────────────

  private async openWebSocket(token: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const model = this.config.model
      const url   = `wss://api.openai.com/v1/realtime?model=${model}`

      // Browser WebSocket authentication via protocol subprotocol headers
      const ws = new WebSocket(url, [
        'realtime',
        `openai-insecure-api-key.${token}`,
        'openai-beta.realtime-v1',
      ])

      ws.onopen = () => {
        this.ws = ws
        this.configureSession()
        this.startPing()
        resolve()
      }

      ws.onmessage = (evt: MessageEvent<string>) => {
        try {
          const event = JSON.parse(evt.data) as RTClientEvent
          if ((event as { type: string; session?: { id?: string } }).type === 'session.created') {
            this.sessionId = ((event as { type: string; session?: { id?: string } }).session?.id) ?? null
          }
          this.handlers.forEach((h) => h(event))
        } catch { /* malformed frame — ignore */ }
      }

      ws.onclose = () => {
        this.ws = null
        if (!this.closed) void this.scheduleReconnect()
      }

      ws.onerror = () => {
        reject(new Error('WebSocket connection failed'))
      }
    })
  }

  private configureSession(): void {
    this.send({
      type: 'session.update',
      session: {
        instructions:       this.config.instructions,
        voice:              this.config.voice,
        input_audio_format: 'pcm16',
        output_audio_format:'pcm16',
        turn_detection: {
          type:                     'server_vad',
          threshold:                0.5,
          prefix_padding_ms:        300,
          silence_duration_ms:      800,
        },
        input_audio_transcription: { model: 'whisper-1' },
        modalities: ['text', 'audio'],
      },
    })
  }

  private startPing(): void {
    // Keep WebSocket alive — OpenAI closes idle connections after ~30s
    this.pingTimer = setInterval(() => {
      if (this.ws?.readyState === WebSocket.OPEN) {
        this.send({ type: 'session.update', session: {} })
      }
    }, 20_000)
  }

  private async scheduleReconnect(): Promise<void> {
    if (this.reconnecting || this.closed) return
    this.reconnecting = true
    await new Promise((r) => setTimeout(r, 2_000))
    this.reconnecting = false
    if (!this.closed) {
      try { await this.connect() } catch { /* silent — SessionOrchestrator handles error state */ }
    }
  }
}
