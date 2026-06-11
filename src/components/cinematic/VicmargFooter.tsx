'use client'

import Link                from 'next/link'
import { useSceneStore }   from '@store/scene.store'
import { VicmargLogo }     from '@components/brand/VicmargLogo'

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
        opacity:    isConversion ? 1 : 0.80,
      }}
    >
      {/* Separator line */}
      <div
        className="h-px"
        style={{
          background: isConversion
            ? 'linear-gradient(90deg, transparent, rgba(245,158,11,0.50), transparent)'
            : 'linear-gradient(90deg, transparent, rgba(255,255,255,0.18), transparent)',
          transition: 'background 700ms ease',
        }}
      />

      <div
        className="px-6 py-4"
        style={{
          background:           isConversion
            ? 'rgba(10,8,4,0.94)'
            : 'rgba(4,5,14,0.93)',
          backdropFilter:       'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          transition:           'background 700ms ease',
        }}
      >
        <div className="max-w-5xl mx-auto flex items-start justify-between gap-8">

          {/* ── Brand — left ───────────────────────────────────────── */}
          <div className="pointer-events-auto shrink-0">
            <Link href="/" aria-label="VICMARG inicio">
              <VicmargLogo
                size="sm"
                layout="horizontal"
                opacity={isConversion ? 1 : 0.88}
                glowColor={isConversion ? '#f59e0b' : '#60a5fa'}
              />
            </Link>
          </div>

          {/* ── Nav — vertical, center ─────────────────────────────── */}
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

          {/* ── Copyright — right ──────────────────────────────────── */}
          <div className="hidden sm:flex flex-col items-end gap-1 shrink-0 pt-0.5">
            <p
              className="text-[9px] font-mono tracking-wide text-right leading-relaxed"
              style={{ color: isConversion ? 'rgba(245,158,11,0.45)' : 'rgba(255,255,255,0.28)' }}
            >
              © {YEAR} VICMARG<br />
              Todos los derechos<br />
              reservados.
            </p>
          </div>

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
  href:      string
  children:  React.ReactNode
  dim?:      boolean
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
