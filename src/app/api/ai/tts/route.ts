// POST /api/ai/tts
// Server-side TTS proxy — keeps API keys server-side.
// Supports: openai (default), elevenlabs (when ELEVENLABS_API_KEY set).
// Returns: audio/mpeg blob

import { type NextRequest, NextResponse } from 'next/server'

interface TTSBody {
  text:      string
  provider?: 'openai' | 'elevenlabs'
  voice?:    string
  voiceId?:  string
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  const body = await req.json() as TTSBody
  const { text, provider = 'openai', voice = 'alloy', voiceId } = body

  if (!text?.trim()) {
    return NextResponse.json({ error: 'text required' }, { status: 400 })
  }

  try {
    if (provider === 'elevenlabs') {
      return await elevenLabsTTS(text, voiceId ?? process.env.ELEVENLABS_VOICE_ID ?? '')
    }
    return await openaiTTS(text, voice)
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'TTS failed' },
      { status: 500 }
    )
  }
}

async function openaiTTS(text: string, voice: string): Promise<NextResponse> {
  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) return NextResponse.json({ error: 'OpenAI not configured' }, { status: 503 })

  const res = await fetch('https://api.openai.com/v1/audio/speech', {
    method:  'POST',
    headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model:           'tts-1',
      input:           text,
      voice:           voice,
      response_format: 'mp3',
    }),
  })

  if (!res.ok) return NextResponse.json({ error: await res.text() }, { status: res.status })

  const audio = await res.arrayBuffer()
  return new NextResponse(audio, {
    headers: { 'Content-Type': 'audio/mpeg', 'Cache-Control': 'no-store' },
  })
}

async function elevenLabsTTS(text: string, voiceId: string): Promise<NextResponse> {
  const apiKey = process.env.ELEVENLABS_API_KEY
  if (!apiKey || !voiceId) {
    return NextResponse.json({ error: 'ElevenLabs not configured' }, { status: 503 })
  }

  const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}/stream`, {
    method: 'POST',
    headers: {
      'xi-api-key':   apiKey,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      text,
      model_id: 'eleven_multilingual_v2',
      voice_settings: { stability: 0.7, similarity_boost: 0.85 },
    }),
  })

  if (!res.ok) return NextResponse.json({ error: await res.text() }, { status: res.status })

  const audio = await res.arrayBuffer()
  return new NextResponse(audio, {
    headers: { 'Content-Type': 'audio/mpeg', 'Cache-Control': 'no-store' },
  })
}
