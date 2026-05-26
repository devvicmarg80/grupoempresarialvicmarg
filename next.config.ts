import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // ─── Experimental Features ────────────────────────────────────────────────
  experimental: {
    optimizePackageImports: ['gsap', '@gsap/react', 'framer-motion', 'zustand'],
    typedRoutes: true,
  },

  // ─── Image Optimization ───────────────────────────────────────────────────
  images: {
    remotePatterns: [
      // Cloudflare R2 — Video posters + static assets
      { protocol: 'https', hostname: '**.r2.cloudflarestorage.com' },
      // Cloudflare Stream — Video thumbnails
      { protocol: 'https', hostname: '**.cloudflarestream.com' },
      // Cloudflare CDN
      { protocol: 'https', hostname: '**.cloudflare.com' },
    ],
    formats: ['image/avif', 'image/webp'],
    // Mobile-first device sizes: 390 (iPhone), 768, 1024, 1280, 1920
    deviceSizes: [390, 768, 1024, 1280, 1920],
    imageSizes: [32, 64, 128, 256, 384],
    minimumCacheTTL: 31536000, // 1 year for immutable assets
  },

  // ─── Security & Performance Headers ──────────────────────────────────────
  async headers() {
    return [
      // Global security headers
      {
        source: '/:path*',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-XSS-Protection', value: '1; mode=block' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          // Microphone allowed (self) for future OpenAI Realtime
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(self), geolocation=()',
          },
        ],
      },
      // Immutable static assets
      {
        source: '/assets/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      // Fonts — preloaded, long cache
      {
        source: '/assets/fonts/:path*',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
          { key: 'Access-Control-Allow-Origin', value: '*' },
        ],
      },
    ]
  },

  // ─── Video CDN Proxy ──────────────────────────────────────────────────────
  // Proxies /videos/* to Cloudflare R2 — keeps video URLs clean
  async rewrites() {
    const r2Url = process.env.CLOUDFLARE_R2_PUBLIC_URL ?? ''
    if (!r2Url) return []

    return [
      {
        source: '/videos/:path*',
        destination: `${r2Url}/videos/:path*`,
      },
    ]
  },

  // ─── Webpack Customization ────────────────────────────────────────────────
  webpack(config, { isServer }) {
    // Three.js — never bundle on server, always dynamic client import
    if (isServer) {
      config.externals = [
        ...(Array.isArray(config.externals) ? config.externals : []),
        'three',
        'hls.js',
      ]
    }

    // Ensure GSAP tree-shaking works correctly
    config.module.rules.push({
      test: /gsap/,
      sideEffects: false,
    })

    return config
  },
}

export default nextConfig
