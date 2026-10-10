export type Metaball = {
  position: [number, number, number]
  radius: number
}

export type MetaballMotion = {
  idleMotion: number
  idleSpeed: number
  pointerStrength: number
  pointerRadius: number
  scrollProgress: number
  scrollSpread: number
  scrollDrift: number
}

export type PointerTarget = {
  x: number
  y: number
  z: number
}

export function writeMetaballs(
  target: Float32Array,
  metaballs: Metaball[],
  time: number,
  pointer: PointerTarget,
  motion: MetaballMotion,
): void {
  const t = time * motion.idleSpeed

  for (let i = 0; i < metaballs.length; i++) {
    const ball = metaballs[i]
    const [baseX, baseY, baseZ] = ball.position

    let x =
      baseX + (Math.sin(t * 0.53 + i * 1.7) * 0.6 + Math.sin(t * 0.31 + i * 4.1) * 0.4) * motion.idleMotion
    let y =
      baseY + (Math.cos(t * 0.47 + i * 2.3) * 0.6 + Math.cos(t * 0.29 + i * 5.3) * 0.4) * motion.idleMotion
    let z = baseZ + Math.sin(t * 0.61 + i * 3.1) * 0.5 * motion.idleMotion

    const dx = pointer.x - x
    const dy = pointer.y - y
    const dz = pointer.z - z
    const distance = Math.sqrt(dx * dx + dy * dy + dz * dz)

    if (distance > 1e-4 && motion.pointerStrength !== 0) {
      const radius = Math.max(motion.pointerRadius, 1e-3)
      const falloff = Math.exp(-(distance * distance) / (2 * radius * radius))
      const pull = (motion.pointerStrength * falloff) / distance
      x += dx * pull
      y += dy * pull
      z += dz * pull
    }

    const spread = 1 + motion.scrollProgress * motion.scrollSpread
    x *= spread
    y = y * spread + motion.scrollProgress * motion.scrollDrift

    const offset = i * 4
    target[offset] = x
    target[offset + 1] = y
    target[offset + 2] = z
    target[offset + 3] = ball.radius * (1 - motion.scrollProgress * 0.25)
  }
}

export function ndcToBlobPlane(
  ndcX: number,
  ndcY: number,
  aspect: number,
  cameraDistance: number,
  focalLength: number,
): PointerTarget {
  return {
    x: (cameraDistance * aspect * ndcX) / focalLength,
    y: (cameraDistance * ndcY) / focalLength,
    z: 0,
  }
}

export const damp = (current: number, target: number, lambda: number, delta: number): number =>
  current + (target - current) * (1 - Math.exp(-lambda * delta))
