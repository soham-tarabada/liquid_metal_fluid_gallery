import type { QualityTier } from '@/lib/quality'

export type DevFlags = {
  perf: boolean
  tier: QualityTier | null
  steps: number | null
  scale: number | null
  balls: number | null
  goo: 'on' | 'off' | null
}

const EMPTY: DevFlags = {
  perf: false,
  tier: null,
  steps: null,
  scale: null,
  balls: null,
  goo: null,
}

const isTier = (value: string | null): value is QualityTier =>
  value === 'high' || value === 'medium' || value === 'low'

export function readDevFlags(): DevFlags {
  if (typeof window === 'undefined') return EMPTY

  const params = new URLSearchParams(window.location.search)

  const readInt = (key: string, min: number, max: number): number | null => {
    const raw = params.get(key)
    if (raw === null) return null
    const parsed = Math.floor(Number(raw))
    if (!Number.isFinite(parsed)) return null
    return Math.min(max, Math.max(min, parsed))
  }

  const readFloat = (key: string, min: number, max: number): number | null => {
    const raw = params.get(key)
    if (raw === null) return null
    const parsed = Number(raw)
    if (!Number.isFinite(parsed)) return null
    return Math.min(max, Math.max(min, parsed))
  }

  const tier = params.get('tier')

  return {
    perf: params.has('perf'),
    tier: isTier(tier) ? tier : null,
    steps: readInt('steps', 8, 256),
    scale: readFloat('scale', 0.1, 1),
    balls: readInt('balls', 1, 6),
    goo: params.get('goo') === 'off' ? 'off' : params.get('goo') === 'on' ? 'on' : null,
  }
}
