import { NextRequest, NextResponse } from 'next/server'

interface LeadPayload {
  name:    string
  email:   string
  phone:   string
  message?: string
  source?:  string
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as LeadPayload
    const { name, email, phone } = body

    if (!name?.trim() || !email?.trim() || !phone?.trim()) {
      return NextResponse.json({ error: 'Faltan campos requeridos' }, { status: 400 })
    }

    // Phase 7: replace with Supabase insert
    // await supabase.from('leads').insert({ name, email, phone, message, source, created_at: new Date() })

    console.log('[VICMARG Lead]', {
      name:    name.trim(),
      email:   email.trim(),
      phone:   phone.trim(),
      message: body.message?.trim() ?? '',
      source:  body.source ?? 'direct',
      ts:      new Date().toISOString(),
    })

    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
