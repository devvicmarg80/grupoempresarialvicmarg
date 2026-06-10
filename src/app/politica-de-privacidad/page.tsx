import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Política de Privacidad — VICMARG',
  description: 'Política de tratamiento de datos personales de Grupo Empresarial VICMARG, conforme a la Ley 1581 de 2012 y el Decreto 1377 de 2013.',
}

const YEAR = new Date().getFullYear()

export default function PoliticaDePrivacidadPage() {
  return (
    <main className="min-h-screen bg-[#0d0d1f] text-white/85 font-mono">

      {/* Header */}
      <header className="border-b border-white/8 px-6 py-5">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-2.5 text-white/60 hover:text-white/90 transition-colors"
          >
            <div className="w-6 h-6 rounded-full bg-blue-800/40 border border-blue-400/30 flex items-center justify-center">
              <span className="text-blue-400 text-[8px] font-semibold">VM</span>
            </div>
            <span className="text-[11px] uppercase tracking-widest">VICMARG</span>
          </Link>
          <span className="text-[10px] text-white/35 uppercase tracking-widest">
            Política de Privacidad
          </span>
        </div>
      </header>

      {/* Content */}
      <article className="max-w-3xl mx-auto px-6 py-14 space-y-10">

        <section className="space-y-3">
          <h1 className="text-2xl text-white/90 tracking-tight" style={{ fontFamily: 'var(--font-cinematic)', fontWeight: 300 }}>
            Política de Tratamiento de Datos Personales
          </h1>
          <p className="text-[11px] text-white/40 uppercase tracking-widest">
            Grupo Empresarial VICMARG S.A.S. — Versión vigente {YEAR}
          </p>
          <p className="text-sm text-white/65 leading-relaxed">
            En cumplimiento de la <strong className="text-white/85">Ley Estatutaria 1581 de 2012</strong> (Protección
            de Datos Personales), el <strong className="text-white/85">Decreto 1377 de 2013</strong> que la
            reglamenta y las instrucciones de la Superintendencia de Industria y Comercio (SIC), Grupo
            Empresarial VICMARG adopta la presente política para el tratamiento de datos personales.
          </p>
        </section>

        <Divider />

        <Section title="1. Responsable del Tratamiento">
          <Row label="Razón Social" value="Grupo Empresarial VICMARG S.A.S." />
          <Row label="Domicilio" value="Colombia" />
          <Row label="Correo de Contacto" value="desarrollo@grupoempresarialvicmarg.com" />
          <Row label="Sitio Web" value="www.grupoempresarialvicmarg.com" />
        </Section>

        <Divider />

        <Section title="2. Datos que Recopilamos">
          <p className="text-sm text-white/65 leading-relaxed mb-4">
            VICMARG recopila únicamente los datos necesarios para los fines descritos en esta política:
          </p>
          <ul className="space-y-2 text-sm text-white/65">
            <DataItem>Nombre completo</DataItem>
            <DataItem>Correo electrónico</DataItem>
            <DataItem>Número de teléfono / WhatsApp</DataItem>
            <DataItem>Mensaje o consulta enviada voluntariamente a través del formulario web</DataItem>
            <DataItem>Datos técnicos de navegación (tipo de dispositivo, navegador) con fines estadísticos anónimos</DataItem>
          </ul>
        </Section>

        <Divider />

        <Section title="3. Finalidad del Tratamiento">
          <ul className="space-y-2 text-sm text-white/65">
            <DataItem>Atender consultas, solicitudes de información y pre-registros</DataItem>
            <DataItem>Contactar al usuario a través de los canales suministrados (correo, teléfono, WhatsApp)</DataItem>
            <DataItem>Enviar información comercial sobre los servicios de Asesoría Educativa y Asesoría Empresarial, previo consentimiento</DataItem>
            <DataItem>Mejorar la experiencia del sitio web mediante análisis estadísticos anónimos</DataItem>
            <DataItem>Cumplir obligaciones legales y contractuales</DataItem>
          </ul>
        </Section>

        <Divider />

        <Section title="4. Base Legal">
          <p className="text-sm text-white/65 leading-relaxed">
            El tratamiento se realiza con base en el <strong className="text-white/80">consentimiento libre, previo, expreso e informado</strong> del
            titular, conforme al artículo 9 de la Ley 1581 de 2012. Al diligenciar cualquier formulario en
            nuestro sitio web, el titular otorga su autorización expresa para el tratamiento descrito en
            esta política.
          </p>
        </Section>

        <Divider />

        <Section title="5. Derechos del Titular">
          <p className="text-sm text-white/65 leading-relaxed mb-4">
            Conforme a los artículos 8 y 21 de la Ley 1581 de 2012, el titular de datos personales tiene
            derecho a:
          </p>
          <ul className="space-y-2 text-sm text-white/65">
            <DataItem><strong className="text-white/80">Conocer</strong> los datos personales que VICMARG trata sobre él.</DataItem>
            <DataItem><strong className="text-white/80">Actualizar y rectificar</strong> sus datos cuando sean inexactos o incompletos.</DataItem>
            <DataItem><strong className="text-white/80">Solicitar prueba</strong> de la autorización otorgada.</DataItem>
            <DataItem><strong className="text-white/80">Revocar</strong> la autorización y/o solicitar la supresión del dato cuando no se respeten los principios del tratamiento.</DataItem>
            <DataItem><strong className="text-white/80">Acceder</strong> gratuitamente a sus datos personales que hayan sido objeto de tratamiento.</DataItem>
            <DataItem><strong className="text-white/80">Presentar quejas</strong> ante la Superintendencia de Industria y Comercio (SIC) por infracciones a la Ley 1581 de 2012.</DataItem>
          </ul>
          <p className="text-sm text-white/55 leading-relaxed mt-4">
            Para ejercer estos derechos, el titular puede escribir a{' '}
            <a
              href="mailto:desarrollo@grupoempresarialvicmarg.com"
              className="text-blue-400/80 hover:text-blue-400 transition-colors underline underline-offset-2"
            >
              desarrollo@grupoempresarialvicmarg.com
            </a>
            . VICMARG dará respuesta en un término máximo de <strong className="text-white/80">quince (15) días hábiles</strong>, prorrogables
            por ocho (8) días hábiles adicionales cuando sea necesario.
          </p>
        </Section>

        <Divider />

        <Section title="6. Transferencia y Transmisión">
          <p className="text-sm text-white/65 leading-relaxed">
            VICMARG no vende, alquila ni transfiere datos personales a terceros sin la autorización
            previa del titular, salvo en los casos previstos en el artículo 10 de la Ley 1581 de 2012
            (mandato legal, estado de emergencia, etc.). Los proveedores de servicios tecnológicos que
            actúen como encargados del tratamiento deberán suscribir el correspondiente contrato de
            confidencialidad y cumplir las mismas garantías que VICMARG.
          </p>
        </Section>

        <Divider />

        <Section title="7. Vigencia y Conservación">
          <p className="text-sm text-white/65 leading-relaxed">
            Los datos personales serán conservados durante el tiempo necesario para cumplir las
            finalidades descritas y por el período que exijan las obligaciones legales y contractuales
            aplicables. Una vez cumplidos estos plazos, los datos serán suprimidos o anonimizados de
            forma segura.
          </p>
        </Section>

        <Divider />

        <Section title="8. Seguridad de la Información">
          <p className="text-sm text-white/65 leading-relaxed">
            VICMARG implementa medidas técnicas, humanas y administrativas necesarias para garantizar
            la seguridad de los datos personales y evitar su adulteración, pérdida, consulta, uso o
            acceso no autorizado o fraudulento, conforme al artículo 17 literal (e) de la Ley 1581 de 2012.
          </p>
        </Section>

        <Divider />

        <Section title="9. Modificaciones a esta Política">
          <p className="text-sm text-white/65 leading-relaxed">
            VICMARG se reserva el derecho de modificar esta política en cualquier momento. Los cambios
            sustanciales serán comunicados a los titulares a través del sitio web o por correo electrónico,
            con al menos diez (10) días hábiles de anticipación a su entrada en vigencia.
          </p>
        </Section>

        <Divider />

        <Section title="10. Normativa Aplicable">
          <ul className="space-y-2 text-sm text-white/65">
            <DataItem>Ley 1581 de 2012 — Régimen general de protección de datos personales</DataItem>
            <DataItem>Decreto 1377 de 2013 — Reglamentación parcial de la Ley 1581</DataItem>
            <DataItem>Decreto 1074 de 2015 — Decreto Único Reglamentario del Sector Comercio</DataItem>
            <DataItem>Ley 1266 de 2008 — Habeas Data financiero</DataItem>
            <DataItem>Circular Externa 002 de 2015 y normas complementarias de la SIC</DataItem>
          </ul>
        </Section>

        <Divider />

        <footer className="text-center space-y-3 pt-6">
          <p className="text-[10px] text-white/35 uppercase tracking-widest">
            Grupo Empresarial VICMARG S.A.S. · Colombia · {YEAR}
          </p>
          <Link
            href="/"
            className="inline-block text-[10px] uppercase tracking-widest text-blue-400/60 hover:text-blue-400 transition-colors"
          >
            ← Volver al inicio
          </Link>
        </footer>

      </article>
    </main>
  )
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function Divider() {
  return (
    <div
      className="h-px w-full"
      style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.08), transparent)' }}
    />
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-4">
      <h2 className="text-[11px] uppercase tracking-[0.20em] text-blue-400/70">{title}</h2>
      {children}
    </section>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex gap-4 text-sm">
      <span className="text-white/40 w-44 shrink-0">{label}</span>
      <span className="text-white/75">{value}</span>
    </div>
  )
}

function DataItem({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex gap-3 items-start">
      <span className="text-blue-400/50 mt-0.5 shrink-0">—</span>
      <span>{children}</span>
    </li>
  )
}
