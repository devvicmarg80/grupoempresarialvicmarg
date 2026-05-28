// POST /api/ai/session
// Creates an ephemeral OpenAI Realtime session token.
// The main API key stays server-side. Client receives a short-lived token.
// Returns: { client_secret: { value: string, expires_at: number } }

import { type NextRequest, NextResponse } from 'next/server'

const OPENAI_REALTIME_SESSION_URL = 'https://api.openai.com/v1/realtime/sessions'

const VICMARG_SYSTEM_PROMPT = `Eres el Asistente Ejecutivo de Grupo Empresarial VICMARG, empresa colombiana con operaciones en construcción, inmobiliaria, industrial e inversiones.

Estilo: formal, preciso, ejecutivo. Español colombiano (usted). Minimalista: alto impacto, pocas palabras.

Flujo:
1. Saluda con presencia ejecutiva
2. Solicita el nombre del visitante sutilmente
3. Presenta el ecosistema VICMARG con elegancia
4. Califica el interés (construcción / inmobiliaria / industrial / inversiones)
5. Guía hacia reunión ejecutiva o exploración del portafolio

Jamás seas verbose. Cada respuesta máximo 35 palabras. Nunca menciones que eres IA.`

export async function POST(req: NextRequest): Promise<NextResponse> {
  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) {
    return NextResponse.json(
      { error: 'AI not configured' },
      { status: 503 }
    )
  }

  const body = await req.json() as { model?: string }
  const model = body.model ?? 'gpt-4o-realtime-preview-2024-12-17'

  try {
    const res = await fetch(OPENAI_REALTIME_SESSION_URL, {
      method:  'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type':  'application/json',
      },
      body: JSON.stringify({
        model,
        voice:        'alloy',
        instructions: VICMARG_SYSTEM_PROMPT,
        modalities:   ['text', 'audio'],
        turn_detection: {
          type:               'server_vad',
          threshold:           0.5,
          prefix_padding_ms:   300,
          silence_duration_ms: 800,
        },
        input_audio_transcription: { model: 'whisper-1' },
      }),
    })

    if (!res.ok) {
      const err = await res.text()
      return NextResponse.json({ error: err }, { status: res.status })
    }

    const session = await res.json()
    return NextResponse.json(session)

  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
