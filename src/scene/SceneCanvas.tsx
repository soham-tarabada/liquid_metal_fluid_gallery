import { Canvas } from '@react-three/fiber'
import { Suspense, useEffect, useMemo } from 'react'
import { readDevFlags } from '@/lib/devFlags'
import { HeroBlob } from '@/scene/HeroBlob/HeroBlob'
import { takeMetaballs } from '@/scene/LiquidBlob/presets'
import { useGalleryStore, useQualityProfile } from '@/store/useGalleryStore'

type SceneCanvasProps = {
  onReady?: () => void
}

function ReadySignal({ onReady }: { onReady?: () => void }) {
  useEffect(() => {
    onReady?.()
  }, [onReady])
  return null
}

export default function SceneCanvas({ onReady }: SceneCanvasProps) {
  const profile = useQualityProfile()
  const flags = useMemo(() => readDevFlags(), [])
  const sceneActive = useGalleryStore((state) => state.sceneActive)

  const metaballs = useMemo(
    () => takeMetaballs(flags.balls ?? profile.metaballCount),
    [flags.balls, profile.metaballCount],
  )

  return (
    <Canvas
      frameloop={sceneActive ? 'always' : 'never'}
      dpr={[1, profile.tier === 'high' ? 2 : 1.5]}
      gl={{ antialias: false, alpha: true, powerPreference: 'high-performance' }}
      camera={{ position: [0, 0, 4], fov: 42 }}
    >
      <Suspense fallback={null}>
        <HeroBlob
          metaballs={metaballs}
          steps={flags.steps ?? undefined}
          renderScale={flags.scale ?? undefined}
        />
        <ReadySignal onReady={onReady} />
      </Suspense>
    </Canvas>
  )
}
