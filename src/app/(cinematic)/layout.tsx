import { SystemProvider }      from '@components/providers/SystemProvider'
import { PerformanceProvider } from '@components/providers/PerformanceProvider'

/**
 * Cinematic route group layout.
 * All routes under (cinematic)/ get:
 *   - GSAPRegistry initialized
 *   - VideoEngine initialized
 *   - Device capability detection
 *   - FPS monitoring
 *
 * Non-cinematic routes (/api, future /admin) remain lightweight.
 */
export default function CinematicLayout({ children }: { children: React.ReactNode }) {
  return (
    <SystemProvider>
      <PerformanceProvider>
        {children}
      </PerformanceProvider>
    </SystemProvider>
  )
}
