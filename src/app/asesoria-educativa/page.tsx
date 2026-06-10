import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Asesoría Educativa — VICMARG',
  description: 'Formación empresarial de alto impacto. Diplomados ejecutivos, certificaciones corporativas y programas de capacitación para transformar tu organización.',
}

const BENEFITS = [
  {
    icon: '◈',
    title: 'Diplomados Ejecutivos',
    desc: 'Programas intensivos diseñados para líderes empresariales que buscan acelerar su crecimiento profesional y organizacional.',
  },
  {
    icon: '◇',
    title: 'Certificaciones Corporativas',
    desc: 'Certificaciones reconocidas que avalan las competencias de tu equipo y posicionan a tu empresa en el mercado.',
  },
  {
    icon: '◉',
    title: 'Capacitación In-Company',
    desc: 'Programas a la medida de tu empresa. Formamos a tu equipo directamente en tu entorno de trabajo.',
  },
  {
    icon: '◎',
    title: 'Alianzas Académicas',
    desc: 'Red de instituciones educativas aliadas que respaldan la calidad y vigencia de nuestros programas formativos.',
  },
]

const WHATSAPP_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? '573000000000'

export default function AsesoriaEducativaPage() {
  const waMessage = encodeURIComponent('Hola VICMARG, me interesa conocer más sobre la Asesoría Educativa.')
  const waUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${waMessage}`

  return (
    <main
      className="min-h-screen text-white relative overflow-hidden"
      style={{ background: 'linear-gradient(160deg, #04050e 0%, #080c1c 50%, #0c1428 100%)' }}
    >
      {/* Background glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse 70% 50% at 50% 0%, rgba(37,99,235,0.12) 0%, transparent 70%)',
        }}
      />

      {/* Nav */}
      <nav className="relative z-10 flex items-center justify-between px-6 py-5 border-b border-white/5">
        <Link
          href="/"
          className="flex items-center gap-2 text-white/40 hover:text-white/70 transition-colors text-sm"
        >
          ← Volver a VICMARG
        </Link>
        <span
          className="text-xs uppercase tracking-[0.18em] text-blue-400/50 font-mono"
        >
          Asesoría Educativa
        </span>
      </nav>

      {/* Hero */}
      <section className="relative z-10 px-6 pt-20 pb-16 max-w-4xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 mb-6 px-4 py-1.5 rounded-full border border-blue-500/20 bg-blue-500/5">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
          <span className="text-xs uppercase tracking-[0.14em] text-blue-400/70 font-mono">
            Formación Empresarial
          </span>
        </div>

        <h1
          className="text-5xl md:text-6xl leading-none mb-6 text-white/95"
          style={{ fontFamily: 'var(--font-cinematic)', fontWeight: 300, letterSpacing: '-0.04em' }}
        >
          Asesoría
          <br />
          <span style={{ color: 'rgba(96,165,250,0.9)' }}>Educativa</span>
        </h1>

        <p className="text-lg text-white/45 max-w-xl mx-auto leading-relaxed mb-10">
          Formación empresarial de alto impacto para líderes y organizaciones
          que buscan su siguiente nivel de excelencia.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <a
            href={waUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl text-sm font-medium tracking-wide transition-all duration-300 hover:scale-105"
            style={{
              background:   'rgba(37,99,235,0.75)',
              border:       '1px solid rgba(96,165,250,0.4)',
              color:        '#e2e8f0',
            }}
          >
            Solicitar información
          </a>
          <a
            href="#programas"
            className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl text-sm font-medium tracking-wide transition-all duration-300"
            style={{
              background: 'rgba(255,255,255,0.04)',
              border:     '1px solid rgba(255,255,255,0.1)',
              color:      'rgba(255,255,255,0.6)',
            }}
          >
            Ver programas ↓
          </a>
        </div>
      </section>

      {/* Benefits */}
      <section id="programas" className="relative z-10 px-6 pb-20 max-w-4xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {BENEFITS.map((b) => (
            <div
              key={b.title}
              className="rounded-2xl p-6 transition-all duration-300 hover:-translate-y-1"
              style={{
                background: 'rgba(255,255,255,0.03)',
                border:     '1px solid rgba(255,255,255,0.07)',
              }}
            >
              <span
                className="block text-2xl mb-4"
                style={{ color: 'rgba(96,165,250,0.5)' }}
                aria-hidden="true"
              >
                {b.icon}
              </span>
              <h3 className="text-base font-medium text-white/85 mb-2">{b.title}</h3>
              <p className="text-sm text-white/35 leading-relaxed">{b.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Footer */}
      <section className="relative z-10 px-6 pb-20 max-w-2xl mx-auto text-center">
        <div
          className="rounded-2xl p-8"
          style={{
            background: 'rgba(37,99,235,0.08)',
            border:     '1px solid rgba(96,165,250,0.15)',
          }}
        >
          <h2
            className="text-2xl mb-3 text-white/85"
            style={{ fontFamily: 'var(--font-cinematic)', fontWeight: 300 }}
          >
            ¿Listo para transformar tu organización?
          </h2>
          <p className="text-sm text-white/40 mb-6 leading-relaxed">
            Un asesor VICMARG te contactará para diseñar el programa
            que mejor se adapte a tus objetivos.
          </p>
          <a
            href={waUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl text-sm font-medium tracking-wide transition-all duration-300 hover:scale-105"
            style={{
              background: 'rgba(37,99,235,0.75)',
              border:     '1px solid rgba(96,165,250,0.3)',
              color:      '#e2e8f0',
            }}
          >
            Hablar con un asesor →
          </a>
        </div>
      </section>

      {/* Divider line at bottom */}
      <div
        className="absolute bottom-0 left-0 right-0 h-px"
        style={{ background: 'linear-gradient(90deg, transparent, rgba(96,165,250,0.2), transparent)' }}
      />
    </main>
  )
}
