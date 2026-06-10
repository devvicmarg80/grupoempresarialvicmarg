import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Política de Calidad — VICMARG',
  description: 'Política de gestión de calidad de Grupo Empresarial VICMARG: compromisos, objetivos y mejora continua en servicios de asesoría.',
}

const YEAR = new Date().getFullYear()

export default function PoliticaDeCalidadPage() {
  return (
    <main className="min-h-screen bg-[#0d0d1f] text-white/85 font-mono">

      <header className="border-b border-white/8 px-6 py-5">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 text-white/60 hover:text-white/90 transition-colors">
            <div className="w-6 h-6 rounded-full bg-blue-800/40 border border-blue-400/30 flex items-center justify-center">
              <span className="text-blue-400 text-[8px] font-semibold">VM</span>
            </div>
            <span className="text-[11px] uppercase tracking-widest">VICMARG</span>
          </Link>
          <span className="text-[10px] text-white/35 uppercase tracking-widest">Política de Calidad</span>
        </div>
      </header>

      <article className="max-w-3xl mx-auto px-6 py-14 space-y-10">

        <section className="space-y-3">
          <h1 className="text-2xl text-white/90 tracking-tight" style={{ fontFamily: 'var(--font-cinematic)', fontWeight: 300 }}>
            Política de Gestión de Calidad
          </h1>
          <p className="text-[11px] text-white/40 uppercase tracking-widest">
            Grupo Empresarial VICMARG S.A.S. — Versión vigente {YEAR}
          </p>
          <p className="text-sm text-white/65 leading-relaxed">
            Grupo Empresarial VICMARG S.A.S. asume el compromiso de prestar servicios de asesoría
            educativa y empresarial con los más altos estándares de calidad, orientados a la
            satisfacción plena de nuestros clientes y al desarrollo sostenible de las organizaciones
            que acompañamos.
          </p>
        </section>

        <Divider />

        <Section title="1. Declaración de Política">
          <p className="text-sm text-white/65 leading-relaxed">
            VICMARG se compromete a:
          </p>
          <ul className="mt-4 space-y-3 text-sm text-white/65">
            <Item>Entender y superar las expectativas de nuestros clientes en cada proyecto de asesoría.</Item>
            <Item>Garantizar la competencia profesional continua de nuestro equipo mediante formación permanente.</Item>
            <Item>Aplicar metodologías probadas y mejores prácticas del sector en cada servicio prestado.</Item>
            <Item>Gestionar los riesgos asociados a nuestras actividades con criterios de transparencia y responsabilidad.</Item>
            <Item>Promover la mejora continua de todos nuestros procesos, sistemas y resultados.</Item>
          </ul>
        </Section>

        <Divider />

        <Section title="2. Objetivos de Calidad">
          <div className="space-y-5">
            <Objective
              number="01"
              title="Satisfacción del cliente"
              desc="Mantener un índice de satisfacción ≥ 90 % en las encuestas de cierre de cada proyecto."
            />
            <Objective
              number="02"
              title="Entrega oportuna"
              desc="Cumplir los tiempos acordados en el 95 % de los compromisos contractuales."
            />
            <Objective
              number="03"
              title="Competencia del equipo"
              desc="Garantizar que el 100 % del equipo asesor complete al menos 40 horas de formación especializada al año."
            />
            <Objective
              number="04"
              title="Mejora continua"
              desc="Revisar y actualizar los procesos de prestación de servicios al menos una vez por semestre."
            />
            <Objective
              number="05"
              title="Gestión de no conformidades"
              desc="Resolver el 100 % de las reclamaciones formales en un término máximo de 10 días hábiles."
            />
          </div>
        </Section>

        <Divider />

        <Section title="3. Alcance">
          <p className="text-sm text-white/65 leading-relaxed">
            Esta política aplica a todos los servicios de{' '}
            <strong className="text-white/80">Asesoría Educativa</strong> y{' '}
            <strong className="text-white/80">Asesoría Empresarial</strong> prestados por VICMARG,
            incluyendo consultoría, acompañamiento, capacitación y gestión de proyectos, en modalidad
            presencial y virtual para clientes en Colombia y Latinoamérica.
          </p>
        </Section>

        <Divider />

        <Section title="4. Responsabilidades">
          <div className="space-y-3 text-sm text-white/65">
            <p>
              <strong className="text-white/80">Dirección General:</strong> Aprobar, comunicar y revisar la
              presente política, asignando los recursos necesarios para su cumplimiento.
            </p>
            <p>
              <strong className="text-white/80">Líderes de Servicio:</strong> Asegurar que los equipos bajo
              su cargo conozcan y apliquen los estándares de calidad en cada entrega.
            </p>
            <p>
              <strong className="text-white/80">Todo el equipo VICMARG:</strong> Adherirse a los
              procedimientos establecidos y reportar oportunamente cualquier desviación o mejora identificada.
            </p>
          </div>
        </Section>

        <Divider />

        <Section title="5. Marco Normativo de Referencia">
          <ul className="space-y-2 text-sm text-white/65">
            <Item>ISO 9001:2015 — Sistemas de gestión de la calidad (referencia metodológica)</Item>
            <Item>Ley 1480 de 2011 — Estatuto del Consumidor colombiano</Item>
            <Item>Normas técnicas sectoriales aplicables a servicios de consultoría y formación</Item>
          </ul>
        </Section>

        <Divider />

        <Section title="6. Revisión y Actualización">
          <p className="text-sm text-white/65 leading-relaxed">
            La Dirección General de VICMARG revisará esta política anualmente o cuando ocurran cambios
            significativos en el contexto de la organización, los requisitos de clientes o la
            normativa aplicable. Las versiones anteriores quedarán archivadas en el sistema
            documental interno.
          </p>
        </Section>

        <Divider />

        <Section title="7. Contacto">
          <p className="text-sm text-white/65 leading-relaxed">
            Para consultas sobre nuestra política de calidad o para presentar sugerencias de mejora,
            contáctenos en{' '}
            <a
              href="mailto:desarrollo@grupoempresarialvicmarg.com"
              className="text-blue-400/80 hover:text-blue-400 transition-colors underline underline-offset-2"
            >
              desarrollo@grupoempresarialvicmarg.com
            </a>
            {' '}o a través de nuestro canal de{' '}
            <a
              href="https://wa.me/573332555375"
              target="_blank"
              rel="noopener noreferrer"
              className="text-green-400/75 hover:text-green-400 transition-colors underline underline-offset-2"
            >
              WhatsApp
            </a>
            .
          </p>
        </Section>

        <Divider />

        <footer className="text-center space-y-3 pt-6">
          <p className="text-[10px] text-white/35 uppercase tracking-widest">
            Grupo Empresarial VICMARG S.A.S. · Colombia · {YEAR}
          </p>
          <div className="flex items-center justify-center gap-6">
            <Link href="/politica-de-privacidad" className="text-[10px] text-white/35 hover:text-white/65 transition-colors uppercase tracking-widest">
              Política de Privacidad
            </Link>
            <Link href="/" className="text-[10px] text-blue-400/60 hover:text-blue-400 transition-colors uppercase tracking-widest">
              ← Inicio
            </Link>
          </div>
        </footer>

      </article>
    </main>
  )
}

function Divider() {
  return <div className="h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.08), transparent)' }} />
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-4">
      <h2 className="text-[11px] uppercase tracking-[0.20em] text-blue-400/70">{title}</h2>
      {children}
    </section>
  )
}

function Item({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex gap-3 items-start list-none">
      <span className="text-blue-400/50 mt-0.5 shrink-0">—</span>
      <span>{children}</span>
    </li>
  )
}

function Objective({ number, title, desc }: { number: string; title: string; desc: string }) {
  return (
    <div className="flex gap-4 items-start">
      <span className="text-[10px] text-blue-400/40 font-mono mt-0.5 w-6 shrink-0">{number}</span>
      <div>
        <p className="text-[11px] text-white/70 uppercase tracking-wider mb-1">{title}</p>
        <p className="text-sm text-white/55 leading-relaxed">{desc}</p>
      </div>
    </div>
  )
}
