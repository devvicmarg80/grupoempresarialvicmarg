'use client'

// VicmargFooter — fixed bottom bar, always visible across all scenes.
// Opacity intensifies during CONVERSION to reinforce the CTA moment.

import Link from 'next/link'
import { useSceneStore } from '@store/scene.store'

const WHATSAPP_NUMBER  = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? '573000000000'
const WHATSAPP_MESSAGE = encodeURIComponent('Hola VICMARG, me gustaría recibir más información.')
const WHATSAPP_URL     = `https://wa.me/${WHATSAPP_NUMBER}?text=${WHATSAPP_MESSAGE}`

const YEAR = new Date().getFullYear()

export function VicmargFooter() {
  const currentScene = useSceneStore((s) => s.currentScene)
  const isConversion = currentScene === 'CONVERSION'

  return (
    <footer
      className="fixed bottom-0 left-0 right-0 pointer-events-none"
      style={{
        zIndex:     35,
        transition: 'opacity 800ms cubic-bezier(0.76, 0, 0.24, 1)',
        opacity:    isConversion ? 1 : 0.45,
      }}
    >
      {/* Top separator line */}
      <div
        className="h-px"
        style={{
          background: isConversion
            ? 'linear-gradient(90deg, transparent, rgba(245,158,11,0.25), transparent)'
            : 'linear-gradient(90deg, transparent, rgba(255,255,255,0.08), transparent)',
          transition: 'background 800ms ease',
        }}
      />

      <div
        className="px-6 py-3"
        style={{
          background: 'rgba(4,5,14,0.85)',
          backdropFilter:       'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
        }}
      >
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">

          {/* Brand */}
          <div className="flex items-center gap-3">
            <div
              className="w-7 h-7 rounded-full flex items-center justify-center shrink-0"
              style={{ background: 'rgba(37,99,235,0.2)', border: '1px solid rgba(96,165,250,0.2)' }}
            >
              <span className="text-blue-400 text-[9px] font-mono font-medium">VM</span>
            </div>
            <div>
              <p
                className="text-[11px] text-white/60 leading-none"
                style={{ fontFamily: 'var(--font-cinematic)', fontWeight: 400, letterSpacing: '0.06em' }}
              >
                VICMARG
              </p>
              <p className="text-[9px] text-white/25 font-mono uppercase tracking-[0.12em] mt-0.5">
                Grupo Empresarial
              </p>
            </div>
          </div>

          {/* Nav links */}
          <nav className="pointer-events-auto flex items-center gap-5">
            <Link
              href="/asesoria-educativa"
              className="text-[10px] uppercase tracking-[0.14em] text-white/35 hover:text-white/65 transition-colors font-mono"
            >
              Asesoría Educativa
            </Link>
            <span className="text-white/15 text-[10px]">·</span>
            <Link
              href="/asesoria-empresarial"
              className="text-[10px] uppercase tracking-[0.14em] text-white/35 hover:text-white/65 transition-colors font-mono"
            >
              Asesoría Empresarial
            </Link>
            <span className="text-white/15 text-[10px]">·</span>
            <a
              href={WHATSAPP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[10px] uppercase tracking-[0.14em] font-mono transition-colors"
              style={{ color: 'rgba(74,222,128,0.55)' }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.color = 'rgba(74,222,128,0.85)' }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.color = 'rgba(74,222,128,0.55)' }}
            >
              WhatsApp
            </a>
          </nav>

          {/* Copyright */}
          <p className="text-[9px] text-white/20 font-mono tracking-wide hidden sm:block">
            © {YEAR} VICMARG. Todos los derechos reservados.
          </p>

        </div>
      </div>
    </footer>
  )
}
