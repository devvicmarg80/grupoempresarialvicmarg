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
      {/* Separator */}
      <div
        className="h-px"
        style={{
          background: isConversion
            ? 'linear-gradient(90deg, transparent, rgba(245,158,11,0.45), transparent)'
            : 'linear-gradient(90deg, transparent, rgba(255,255,255,0.18), transparent)',
          transition: 'background 600ms ease',
        }}
      />

      <div
        className="px-6 py-4"
        style={{
          background:           'rgba(4,5,14,0.93)',
          backdropFilter:       'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
        }}
      >
        <div className="max-w-5xl mx-auto flex items-start justify-between gap-8">

          {/* Brand — left */}
          <div className="flex items-center gap-2.5 shrink-0 pt-0.5">
            <div
              className="w-7 h-7 rounded-full flex items-center justify-center shrink-0"
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

          {/* Nav — vertical, center */}
          <nav className="pointer-events-auto flex flex-col gap-2 flex-1">
            <NavLink href="/asesoria-educativa">Asesoría Educativa</NavLink>
            <NavLink href="/asesoria-empresarial">Asesoría Empresarial</NavLink>
            <NavLink href="/politica-de-calidad">Política de Calidad</NavLink>
            <NavLink href="/politica-de-privacidad" dim>Política de Privacidad</NavLink>
            <a
              href={WHATSAPP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[10px] uppercase tracking-[0.14em] font-mono text-green-400/70 hover:text-green-400 transition-colors duration-200 w-fit"
            >
              WhatsApp
            </a>
          </nav>

          {/* Copyright — right */}
          <p className="text-[9px] text-white/35 font-mono tracking-wide hidden sm:block shrink-0 pt-0.5 text-right leading-relaxed">
            © {YEAR} VICMARG<br />
            Todos los derechos<br />
            reservados.
          </p>

        </div>
      </div>
    </footer>
  )
}

function NavLink({
  href,
  children,
  dim,
}: {
  href: string
  children: React.ReactNode
  dim?: boolean
}) {
  return (
    <Link
      href={href}
      className={[
        'text-[10px] uppercase tracking-[0.14em] font-mono transition-colors duration-200 w-fit',
        dim
          ? 'text-white/45 hover:text-white/70'
          : 'text-white/65 hover:text-white/95',
      ].join(' ')}
    >
      {children}
    </Link>
  )
}
