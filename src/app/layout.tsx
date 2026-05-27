import type { Metadata, Viewport } from 'next'
import { Cormorant_Garamond, Inter, JetBrains_Mono } from 'next/font/google'
import './globals.css'

// ─── Fonts ────────────────────────────────────────────────────────────────────
// Cinematic serif — hero titles, scene labels, premium CTAs
const cormorant = Cormorant_Garamond({
  subsets:  ['latin'],
  weight:   ['300', '400', '500', '600', '700'],
  variable: '--font-cinematic',
  display:  'swap',
})

// Clean sans-serif — body text, UI labels, overlay content
const inter = Inter({
  subsets:  ['latin'],
  variable: '--font-display',
  display:  'swap',
})

// Monospace — data readouts, technical overlays, dev tools
const mono = JetBrains_Mono({
  subsets:  ['latin'],
  weight:   ['400', '500'],
  variable: '--font-mono',
  display:  'swap',
})

// ─── Metadata ─────────────────────────────────────────────────────────────────
export const metadata: Metadata = {
  title:       'VICMARG — Grupo Empresarial',
  description: 'Experiencia digital inmersiva — Grupo Empresarial VICMARG',
  robots:      { index: false, follow: false }, // Staging — no search indexing
}

// ─── Viewport ─────────────────────────────────────────────────────────────────
// viewport-fit: cover = full bleed on notched devices (iPhone X+, Vision Pro)
export const viewport: Viewport = {
  width:        'device-width',
  initialScale: 1,
  viewportFit:  'cover',
  themeColor:   '#0d0d1f',
}

// ─── Root Layout ──────────────────────────────────────────────────────────────
// Intentionally minimal — cinematic providers live in (cinematic)/layout.tsx
// to keep non-cinematic routes (API, admin) free of heavyweight systems.
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="es"
      className={`${cormorant.variable} ${inter.variable} ${mono.variable}`}
    >
      <body>{children}</body>
    </html>
  )
}
