import type { Metaball } from '@/scene/LiquidBlob/metaballAnimation'

export const HERO_METABALLS: Metaball[] = [
  { position: [-0.82, 0.12, 0.0], radius: 0.64 },
  { position: [0.74, -0.08, 0.22], radius: 0.56 },
  { position: [0.06, 0.58, -0.26], radius: 0.44 },
  { position: [-0.18, -0.62, 0.14], radius: 0.4 },
  { position: [1.16, 0.62, -0.3], radius: 0.31 },
  { position: [-1.24, -0.44, -0.18], radius: 0.28 },
]

export const takeMetaballs = (count: number): Metaball[] =>
  HERO_METABALLS.slice(0, Math.max(1, Math.min(count, HERO_METABALLS.length)))
