// ─── VICMARG Design Token System ────────────────────────────────────────────
// JS/TS tokens — portable to Three.js materials, GSAP, and CSS-in-JS.
// Maps 1:1 to tailwind.config.ts and src/styles/tokens.css
// ───────────────────────────────────────────────────────────────────────────

// ─── Color Tokens ─────────────────────────────────────────────────────────
export const Colors = {
  // Cobalt Blue — primary brand
  cobalt: {
    primary:  '#1e40af', // cobalt-800 — main brand
    light:    '#3b82f6', // cobalt-500
    lighter:  '#60a5fa', // cobalt-400
    dark:     '#1e3a8a', // cobalt-900
    darker:   '#172554', // cobalt-950
    glow:     'rgba(37, 99, 235, 0.4)',
    glowLg:   'rgba(37, 99, 235, 0.2)',
  },
  // Onyx Black — cinematic backgrounds
  onyx: {
    pure:     '#050508', // onyx-950 — absolute black
    deep:     '#080810', // onyx-900
    primary:  '#0d0d1f', // onyx-800 — main background
    surface:  '#141430', // onyx-700
    elevated: '#202040', // onyx-600
  },
  // Graphite Gray — secondary surfaces
  graphite: {
    900: '#181820',
    800: '#252530',
    700: '#383848',
    600: '#505060',
    500: '#707080',
    400: '#a0a0b0',
  },
  // Warm Executive Lights
  warm: {
    gold:    '#f59e0b', // Primary gold accent
    light:   '#fcd34d',
    lighter: '#fde68a',
    glow:    'rgba(245, 158, 11, 0.5)',
  },
  // Semantic
  white:       '#ffffff',
  transparent: 'transparent',
} as const

// ─── Material Tokens (--m-* namespace) ────────────────────────────────────
// Maps directly to Three.js MeshPhysicalMaterial in Phase 3
export const Materials = {
  glass: {
    dark: {
      background:  'rgba(13, 13, 31, 0.70)',    // --m-glass-dark-bg
      border:      'rgba(255, 255, 255, 0.08)', // --m-glass-dark-border
      borderHover: 'rgba(255, 255, 255, 0.16)',
      blur:        '20px',                      // backdrop-filter: blur
      // Three.js: transmission: 0.3, roughness: 0.1, metalness: 0
    },
    cobalt: {
      background:  'rgba(30, 64, 175, 0.15)',
      border:      'rgba(96, 165, 250, 0.20)',
      blur:        '20px',
    },
    warm: {
      background:  'rgba(120, 80, 0, 0.15)',
      border:      'rgba(245, 158, 11, 0.20)',
      blur:        '20px',
    },
    minimal: {
      background:  'rgba(255, 255, 255, 0.03)',
      border:      'rgba(255, 255, 255, 0.05)',
      blur:        '8px',
    },
  },
} as const

// ─── Depth Tokens (--d-* namespace) ───────────────────────────────────────
// Maps to z-position in Three.js scene graph (Phase 3)
export const Depth = {
  floor:    0,    // z=0  — ground plane
  mid:      20,   // z=20 — mid-ground elements
  surface:  40,   // z=40 — UI surface
  float:    80,   // z=80 — floating overlays
  spatial:  120,  // z=120 — spatial UI (Apple Vision Pro-like)
  max:      200,  // z=200 — topmost layer
} as const

// ─── Light Tokens (--l-* namespace) ───────────────────────────────────────
// Maps to Three.js Light configurations
export const Lights = {
  executive: {
    color:     '#fef3c7',  // Warm 200
    intensity: 0.8,
    // Three.js: DirectionalLight({ color, intensity })
  },
  ambient: {
    color:     '#1e3a8a',  // Cobalt-dark
    intensity: 0.3,
    // Three.js: AmbientLight({ color, intensity })
  },
  volumetric: {
    color:     '#3b82f6',  // Cobalt-500
    intensity: 0.5,
    // Three.js: SpotLight or custom shader
  },
  hologram: {
    color:     '#60a5fa',  // Cobalt-400
    intensity: 1.2,
    emissive:  '#1e40af',
    // Three.js: MeshPhysicalMaterial.emissive
  },
} as const

// ─── Animation Tokens (--a-* namespace) ───────────────────────────────────
// Used by GSAP EasingLibrary and CSS transitions
export const Animation = {
  duration: {
    instant:    0,
    micro:      0.15,   // 150ms — hover states
    fast:       0.3,    // 300ms — quick transitions
    standard:   0.6,    // 600ms — overlay enter/exit
    cinematic:  0.8,    // 800ms — scene transitions
    premium:    1.2,    // 1200ms — hero animations
    epic:       2.0,    // 2000ms — full scene entries
  },
  ease: {
    // GSAP ease strings — used in EasingLibrary.ts
    entry:      'power2.out',
    exit:       'power2.in',
    cinematic:  'power4.inOut',
    organic:    'elastic.out(1, 0.5)',
    scroll:     'none',
    text:       'power1.out',
    // CSS bezier equivalents
    css: {
      cinematic: 'cubic-bezier(0.76, 0, 0.24, 1)',
      entry:     'cubic-bezier(0.16, 1, 0.3, 1)',
      exit:      'cubic-bezier(0.4, 0, 1, 1)',
      organic:   'cubic-bezier(0.34, 1.56, 0.64, 1)',
    },
  },
} as const

// ─── Typography Tokens ────────────────────────────────────────────────────
export const Typography = {
  family: {
    cinematic: "'var(--font-cinematic)', system-ui, sans-serif",
    display:   "'var(--font-display)', system-ui, sans-serif",
    mono:      "'var(--font-mono)', ui-monospace, monospace",
  },
  weight: {
    light:      300,
    regular:    400,
    medium:     500,
    semibold:   600,
    bold:       700,
    black:      900,
  },
  letterSpacing: {
    cinematic:  '-0.04em',  // Hero titles
    premium:    '-0.02em',  // Section titles
    standard:    '0.01em',  // Body
    wide:        '0.08em',  // Labels
    ultrawide:   '0.16em',  // Eyebrow text
  },
} as const

// ─── Aggregated Export ────────────────────────────────────────────────────
export const DesignTokens = {
  colors:     Colors,
  materials:  Materials,
  depth:      Depth,
  lights:     Lights,
  animation:  Animation,
  typography: Typography,
} as const

export type DesignTokens = typeof DesignTokens
