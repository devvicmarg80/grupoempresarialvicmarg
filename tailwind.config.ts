import type { Config } from 'tailwindcss'

// ─── VICMARG Design Token System ───────────────────────────────────────────
// These tokens are the single source of truth for the entire visual language.
// They map directly to Three.js material properties in Phase 3.
// Namespace: c=color, s=spacing, d=depth, m=material, l=light, a=animation
// ───────────────────────────────────────────────────────────────────────────

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  darkMode: 'class', // Reserved for future theme switching

  theme: {
    extend: {
      // ─── Color Palette ──────────────────────────────────────────────────
      colors: {
        vicmarg: {
          // Cobalt Blue — primary brand color
          // Three.js: MeshStandardMaterial.color
          cobalt: {
            50:  '#eff6ff',
            100: '#dbeafe',
            200: '#bfdbfe',
            300: '#93c5fd',
            400: '#60a5fa',
            500: '#3b82f6',
            600: '#2563eb',
            700: '#1d4ed8',
            800: '#1e40af', // PRIMARY — main cobalt
            900: '#1e3a8a',
            950: '#172554',
          },
          // Onyx Black — primary background
          // Three.js: scene background, ambient occlusion
          onyx: {
            50:  '#f8f8fa',
            100: '#f0f0f5',
            200: '#e0e0eb',
            300: '#c0c0d5',
            400: '#8080a0',
            500: '#404060',
            600: '#202040',
            700: '#141430',
            800: '#0d0d1f',
            900: '#080810',
            950: '#050508', // DEEP ONYX — pure cinematic black
          },
          // Graphite Gray — secondary surfaces
          graphite: {
            100: '#f4f4f6',
            200: '#e8e8ec',
            300: '#d0d0d8',
            400: '#a0a0b0',
            500: '#707080',
            600: '#505060',
            700: '#383848',
            800: '#252530',
            900: '#181820',
          },
          // Warm Executive Lights — accent lighting
          // Three.js: DirectionalLight color, PointLight color
          warm: {
            100: '#fef9f0',
            200: '#fef3c7',
            300: '#fde68a',
            400: '#fcd34d',
            500: '#f59e0b', // EXECUTIVE GOLD
            600: '#d97706',
            700: '#b45309',
          },
          // Luminous Glass — glassmorphism borders & glows
          // Three.js: MeshPhysicalMaterial.emissive
          luminous: {
            blue:   'rgba(96, 165, 250, 0.6)',
            cobalt: 'rgba(37, 99, 235, 0.4)',
            gold:   'rgba(245, 158, 11, 0.5)',
            white:  'rgba(255, 255, 255, 0.12)',
            glass:  'rgba(255, 255, 255, 0.06)',
          },
        },
      },

      // ─── Typography ────────────────────────────────────────────────────
      fontFamily: {
        cinematic: ['var(--font-cinematic)', 'system-ui', 'sans-serif'],
        display:   ['var(--font-display)', 'system-ui', 'sans-serif'],
        mono:      ['var(--font-mono)', 'ui-monospace', 'monospace'],
      },
      fontSize: {
        // Cinematic scale — wide letter-spacing, premium feel
        '2xs':  ['0.625rem', { lineHeight: '1.6', letterSpacing: '0.12em' }],
        'xs':   ['0.75rem',  { lineHeight: '1.6', letterSpacing: '0.08em' }],
        'sm':   ['0.875rem', { lineHeight: '1.6', letterSpacing: '0.04em' }],
        'base': ['1rem',     { lineHeight: '1.7', letterSpacing: '0.01em' }],
        'lg':   ['1.125rem', { lineHeight: '1.6', letterSpacing: '0em'   }],
        'xl':   ['1.25rem',  { lineHeight: '1.5', letterSpacing: '-0.01em'}],
        '2xl':  ['1.5rem',   { lineHeight: '1.4', letterSpacing: '-0.02em'}],
        '3xl':  ['1.875rem', { lineHeight: '1.3', letterSpacing: '-0.03em'}],
        '4xl':  ['2.25rem',  { lineHeight: '1.2', letterSpacing: '-0.04em'}],
        '5xl':  ['3rem',     { lineHeight: '1.1', letterSpacing: '-0.04em'}],
        '6xl':  ['3.75rem',  { lineHeight: '1.0', letterSpacing: '-0.05em'}],
        '7xl':  ['4.5rem',   { lineHeight: '1.0', letterSpacing: '-0.05em'}],
        '8xl':  ['6rem',     { lineHeight: '0.95',letterSpacing: '-0.06em'}],
      },

      // ─── Spacing ────────────────────────────────────────────────────────
      spacing: {
        // Standard extensions
        '18': '4.5rem',
        '22': '5.5rem',
        '88': '22rem',
        '100': '25rem',
        '112': '28rem',
        '128': '32rem',
        // iOS safe areas — mandatory for mobile-first
        'safe-top':    'env(safe-area-inset-top)',
        'safe-bottom': 'env(safe-area-inset-bottom)',
        'safe-left':   'env(safe-area-inset-left)',
        'safe-right':  'env(safe-area-inset-right)',
      },

      // ─── Height / Width ─────────────────────────────────────────────────
      height: {
        // 100dvh — THE correct way to handle mobile viewport
        'dvh': '100dvh',
        'screen-safe': 'calc(100dvh - env(safe-area-inset-top) - env(safe-area-inset-bottom))',
      },
      minHeight: {
        'dvh': '100dvh',
      },

      // ─── Z-Index — Cinematic Layering System ────────────────────────────
      // Maps to --d-* depth tokens (Three.js z-position in Phase 3)
      zIndex: {
        'scene-base':        '0',
        'scene-video':       '10',  // Video layer
        'scene-content':     '20',  // Content above video
        'overlay-backdrop':  '30',  // Glassmorphism backdrop
        'overlay':           '40',  // Overlay components
        'overlay-priority':  '50',  // High-priority overlays
        'navigation':        '60',  // Navigation elements
        'devtools':          '9999',// CinematicDevTools HUD
      },

      // ─── Glassmorphism ──────────────────────────────────────────────────
      // Maps to --m-glass material token
      backdropBlur: {
        'glass-xs': '4px',
        'glass-sm': '8px',
        'glass':    '20px',
        'glass-lg': '40px',
        'glass-xl': '60px',
        'glass-2xl':'80px',
      },
      backgroundOpacity: {
        '3':  '0.03',
        '5':  '0.05',
        '8':  '0.08',
        '12': '0.12',
        '15': '0.15',
      },

      // ─── Animation Easing ────────────────────────────────────────────────
      // Maps to --a-* animation tokens (GSAP easings in EasingLibrary.ts)
      transitionTimingFunction: {
        'cinematic': 'cubic-bezier(0.76, 0, 0.24, 1)',    // power4.inOut
        'entry':     'cubic-bezier(0.16, 1, 0.3, 1)',     // power2.out
        'exit':      'cubic-bezier(0.4, 0, 1, 1)',        // power2.in
        'organic':   'cubic-bezier(0.34, 1.56, 0.64, 1)', // elastic-like
        'premium':   'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
      },
      transitionDuration: {
        '0':    '0ms',
        '150':  '150ms',
        '300':  '300ms',
        '400':  '400ms',
        '600':  '600ms',
        '800':  '800ms',
        '1200': '1200ms',
        '1600': '1600ms',
        '2000': '2000ms',
      },

      // ─── Keyframe Animations (CSS-only, Tier LOW) ───────────────────────
      // GSAP handles Tier HIGH/MID animations
      animation: {
        'fade-in':      'vm-fadeIn 0.8s var(--ease-entry) forwards',
        'slide-up':     'vm-slideUp 0.8s var(--ease-entry) forwards',
        'slide-in-left':'vm-slideLeft 0.6s var(--ease-entry) forwards',
        'glow-pulse':   'vm-glowPulse 3s ease-in-out infinite',
        'luminous':     'vm-luminous 4s ease-in-out infinite',
        'scan-line':    'vm-scanLine 2s linear infinite',
        'none':         'none',
      },
      keyframes: {
        'vm-fadeIn': {
          '0%':   { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'vm-slideUp': {
          '0%':   { opacity: '0', transform: 'translateY(24px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'vm-slideLeft': {
          '0%':   { opacity: '0', transform: 'translateX(-24px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        'vm-glowPulse': {
          '0%, 100%': { boxShadow: '0 0 20px rgba(37, 99, 235, 0.3)' },
          '50%':      { boxShadow: '0 0 40px rgba(37, 99, 235, 0.6)' },
        },
        'vm-luminous': {
          '0%, 100%': { opacity: '0.5' },
          '50%':      { opacity: '1' },
        },
        'vm-scanLine': {
          '0%':   { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(200%)' },
        },
      },

      // ─── Border Radius ──────────────────────────────────────────────────
      borderRadius: {
        'glass': '16px',
        'glass-sm': '10px',
        'glass-lg': '24px',
        'glass-xl': '32px',
        'cinematic': '4px',
      },

      // ─── Box Shadow — Cinematic Depth ────────────────────────────────────
      boxShadow: {
        'glass':      '0 8px 32px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255,255,255,0.1)',
        'glass-lg':   '0 24px 64px rgba(0, 0, 0, 0.6), inset 0 1px 0 rgba(255,255,255,0.08)',
        'cobalt':     '0 0 40px rgba(37, 99, 235, 0.4)',
        'cobalt-lg':  '0 0 80px rgba(37, 99, 235, 0.3)',
        'gold':       '0 0 30px rgba(245, 158, 11, 0.4)',
        'luminous':   '0 0 60px rgba(96, 165, 250, 0.2)',
        'inner-glow': 'inset 0 0 30px rgba(37, 99, 235, 0.1)',
        'cinematic':  '0 32px 80px rgba(0, 0, 0, 0.8)',
        'none':       'none',
      },
    },
  },

  plugins: [],
}

export default config
