'use client'

import Link from 'next/link'
import { useSceneStore } from '@store/scene.store'

const WHATSAPP_NUMBER  = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? '573332555375'
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
        transition: 'opacity 600ms cubic-bezier(0.76, 0, 0.24, 1)',
        opacity:    isConversion ? 1 : 0.75,
      }}
    >
      {/* Top separator */}
      <div
        className="h-px"
        style={{
          background: isConversion
            ? 'linear-gradient(90deg, transparent, rgba(245,158,11,0.45), transparent)'
            : 'linear-gradient(90deg, transparent, rgba(255,255,255,0.20), transparent)',
          transition: 'background 600ms ease',
        }}
      />

      <div
        className="px-5 py-2.5"
        style={{
          background:           'rgba(4,5,14,0.92)',
          backdropFilter:       'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
        }}
      >
        {/* Main row */}
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">

          {/* Brand */}
          <div className="flex items-center gap-2.5 shrink-0">
            <div
              className="w-7 h-7 rounded-full flex items-center justify-center"
              style={{ background: 'rgba(37,99,235,0.25)', border: '1px solid rgba(96,165,250,0.30)' }}
            >
              <span className="text-blue-400 text-[9px] font-mono font-semibold">VM</span>
            </div>
            <div>
              <p
                className="text-[11px] text-white/85 leading-none"
                style={{ fontFamily: 'var(--font-cinematic)', fontWeight: 400, letterSpacing: '0.06em' }}
              >
                VICMARG
              </p>
              <p className="text-[9px] text-white/50 font-mono uppercase tracking-[0.12em] mt-0.5">
                Grupo Empresarial
              </p>
            </div>
          </div>

          {/* Nav */}
          <nav className="pointer-events-auto flex flex-wrap items-center justify-center gap-x-4 gap-y-1">
            <Link
              href="/asesoria-educativa"
              className="text-[10px] uppercase tracking-[0.14em] text-white/60 hover:text-white/90 transition-colors duration-200 font-mono"
            >
              Asesoría Educativa
            </Link>
            <span className="text-white/25 text-[10px]">·</span>
            <Link
              href="/asesoria-empresarial"
              className="text-[10px] uppercase tracking-[0.14em] text-white/60 hover:text-white/90 transition-colors duration-200 font-mono"
            >
              Asesoría Empresarial
            </Link>
            <span className="text-white/25 text-[10px]">·</span>
            <a
              href={WHATSAPP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[10px] uppercase tracking-[0.14em] font-mono text-green-400/75 hover:text-green-400 transition-colors duration-200"
            >
              WhatsApp
            </a>
            <span className="text-white/25 text-[10px]">·</span>
            <Link
              href="/politica-de-privacidad"
              className="text-[10px] uppercase tracking-[0.14em] text-white/45 hover:text-white/75 transition-colors duration-200 font-mono"
            >
              Política de Privacidad
            </Link>
          </nav>

          {/* Copyright */}
          <p className="text-[9px] text-white/40 font-mono tracking-wide hidden md:block shrink-0">
            © {YEAR} VICMARG. Todos los derechos reservados.
          </p>

        </div>
      </div>
    </footer>
  )
}
