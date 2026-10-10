import { LiquidBlob } from '@/scene/LiquidBlob/LiquidBlob'
import type { Metaball } from '@/scene/LiquidBlob/metaballAnimation'

type HeroBlobProps = {
  metaballs: Metaball[]
  steps?: number
  renderScale?: number
}

export function HeroBlob({ metaballs, steps, renderScale }: HeroBlobProps) {
  return (
    <LiquidBlob
      metaballs={metaballs}
      steps={steps}
      renderScale={renderScale}
      smoothness={0.68}
      tint="#eef1f6"
      fresnelTint="#7d9bff"
      fresnelPower={4.2}
      envIntensity={1.05}
      lightDirection={[0.55, 0.78, 0.62]}
      lightIntensity={1.35}
      specularSharpness={190}
      idleMotion={0.24}
      idleSpeed={0.85}
      pointerStrength={0.5}
      pointerRadius={1.7}
      pointerDamping={4.5}
      scrollSpread={0.55}
      scrollDrift={1.6}
      cameraDistance={4.2}
      focalLength={2.2}
      blur={0.6}
    />
  )
}
