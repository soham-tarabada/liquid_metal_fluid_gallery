export type QualityTier = 'high' | 'medium' | 'low'

export type QualityProfile = {
  tier: QualityTier
  metaballCount: number
  raymarchSteps: number
  renderScale: number
  enableCursorTrail: boolean
  enableBloom: boolean
}

export const QUALITY_PROFILES: Record<QualityTier, QualityProfile> = {
  high: {
    tier: 'high',
    metaballCount: 6,
    raymarchSteps: 80,
    renderScale: 0.75,
    enableCursorTrail: true,
    enableBloom: true,
  },
  medium: {
    tier: 'medium',
    metaballCount: 4,
    raymarchSteps: 56,
    renderScale: 0.6,
    enableCursorTrail: true,
    enableBloom: true,
  },
  low: {
    tier: 'low',
    metaballCount: 3,
    raymarchSteps: 40,
    renderScale: 0.5,
    enableCursorTrail: false,
    enableBloom: false,
  },
}

export const prefersReducedMotion = (): boolean =>
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches

export function detectQualityTier(): QualityTier {
  if (typeof window === 'undefined') return 'medium'

  const nav = navigator as Navigator & { deviceMemory?: number }
  const memory = nav.deviceMemory ?? 4
  const cores = nav.hardwareConcurrency ?? 4
  const coarsePointer = window.matchMedia('(pointer: coarse)').matches
  const narrow = window.matchMedia('(max-width: 768px)').matches
  const dpr = window.devicePixelRatio || 1

  if (!hasWebGL2()) return 'low'
  if (memory <= 2 || cores <= 2) return 'low'
  if (coarsePointer && narrow) return memory >= 6 && cores >= 6 ? 'medium' : 'low'
  if (memory >= 8 && cores >= 8 && dpr <= 2) return 'high'
  if (memory >= 4 && cores >= 4) return 'medium'
  return 'low'
}

function hasWebGL2(): boolean {
  try {
    const canvas = document.createElement('canvas')
    return Boolean(canvas.getContext('webgl2'))
  } catch {
    return false
  }
}
