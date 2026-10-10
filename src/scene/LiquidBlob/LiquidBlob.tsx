import { useFBO } from '@react-three/drei'
import { createPortal, useFrame, useLoader, useThree } from '@react-three/fiber'
import { useEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js'
import {
  damp,
  ndcToBlobPlane,
  writeMetaballs,
  type Metaball,
  type PointerTarget,
} from '@/scene/LiquidBlob/metaballAnimation'
import compositeFrag from '@/scene/LiquidBlob/shaders/composite.frag.glsl'
import compositeVert from '@/scene/LiquidBlob/shaders/composite.vert.glsl'
import raymarchFrag from '@/scene/LiquidBlob/shaders/raymarch.frag.glsl'
import raymarchVert from '@/scene/LiquidBlob/shaders/raymarch.vert.glsl'
import { HDRI } from '@/scene/hdri'
import { useGalleryStore, useQualityProfile } from '@/store/useGalleryStore'

export type LiquidBlobProps = {
  metaballs: Metaball[]
  smoothness?: number
  tint?: string
  fresnelTint?: string
  fresnelPower?: number
  envIntensity?: number
  lightDirection?: [number, number, number]
  lightIntensity?: number
  specularSharpness?: number
  idleMotion?: number
  idleSpeed?: number
  pointerStrength?: number
  pointerRadius?: number
  pointerDamping?: number
  scrollSpread?: number
  scrollDrift?: number
  cameraDistance?: number
  focalLength?: number
  maxDistance?: number
  surfaceEpsilon?: number
  edgeSoftness?: number
  blur?: number
  opacity?: number
  steps?: number
  renderScale?: number
}

export function LiquidBlob({
  metaballs,
  smoothness = 0.62,
  tint = '#eef1f6',
  fresnelTint = '#7d9bff',
  fresnelPower = 4.5,
  envIntensity = 1.0,
  lightDirection = [0.55, 0.75, 0.6],
  lightIntensity = 1.4,
  specularSharpness = 180,
  idleMotion = 0.22,
  idleSpeed = 1,
  pointerStrength = 0.45,
  pointerRadius = 1.6,
  pointerDamping = 5,
  scrollSpread = 0,
  scrollDrift = 0,
  cameraDistance = 4.2,
  focalLength = 2.2,
  maxDistance = 14,
  surfaceEpsilon = 0.0022,
  edgeSoftness = 0.02,
  blur = 0.65,
  opacity = 1,
  steps,
  renderScale,
}: LiquidBlobProps) {
  const size = useThree((state) => state.size)
  const gl = useThree((state) => state.gl)
  const profile = useQualityProfile()

  const maxSteps = Math.floor(steps ?? profile.raymarchSteps)
  const scale = renderScale ?? profile.renderScale
  const maxBalls = Math.max(1, Math.floor(metaballs.length))

  const pixelRatio = gl.getPixelRatio()
  const targetWidth = Math.max(2, Math.floor(size.width * pixelRatio * scale))
  const targetHeight = Math.max(2, Math.floor(size.height * pixelRatio * scale))

  const fbo = useFBO(targetWidth, targetHeight, {
    depthBuffer: false,
    stencilBuffer: false,
    type: THREE.HalfFloatType,
    magFilter: THREE.LinearFilter,
    minFilter: THREE.LinearFilter,
  })

  const envMap = useLoader(RGBELoader, HDRI.studioChrome)

  useEffect(() => {
    envMap.mapping = THREE.EquirectangularReflectionMapping
    envMap.wrapS = THREE.RepeatWrapping
    envMap.wrapT = THREE.ClampToEdgeWrapping
    envMap.minFilter = THREE.LinearFilter
    envMap.magFilter = THREE.LinearFilter
    envMap.generateMipmaps = false
    envMap.needsUpdate = true
  }, [envMap])

  const blobScene = useMemo(() => new THREE.Scene(), [])
  const blobCamera = useMemo(() => new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1), [])

  const ballData = useMemo(() => new Float32Array(maxBalls * 4), [maxBalls])
  const smoothedPointer = useRef<PointerTarget>({ x: 0, y: 0, z: 0 })
  const raymarchMaterial = useRef<THREE.ShaderMaterial>(null)
  const compositeMaterial = useRef<THREE.ShaderMaterial>(null)

  const raymarchUniforms = useMemo(
    () => ({
      uMetaballs: { value: ballData },
      uCount: { value: metaballs.length },
      uSmoothness: { value: smoothness },
      uResolution: { value: new THREE.Vector2(targetWidth, targetHeight) },
      uCameraPos: { value: new THREE.Vector3(0, 0, cameraDistance) },
      uFocalLength: { value: focalLength },
      uMaxDistance: { value: maxDistance },
      uSurfaceEpsilon: { value: surfaceEpsilon },
      uEdgeSoftness: { value: edgeSoftness },
      uEnvMap: { value: envMap },
      uEnvIntensity: { value: envIntensity },
      uTint: { value: new THREE.Color(tint) },
      uFresnelTint: { value: new THREE.Color(fresnelTint) },
      uFresnelPower: { value: fresnelPower },
      uLightDir: { value: new THREE.Vector3(...lightDirection) },
      uLightIntensity: { value: lightIntensity },
      uSpecularSharpness: { value: specularSharpness },
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [ballData, envMap],
  )

  const compositeUniforms = useMemo(
    () => ({
      uMap: { value: fbo.texture },
      uTexelSize: { value: new THREE.Vector2(1 / targetWidth, 1 / targetHeight) },
      uBlurAmount: { value: blur },
      uOpacity: { value: opacity },
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [fbo],
  )

  const defines = useMemo(
    () => ({ MAX_BALLS: maxBalls, MAX_STEPS: maxSteps }),
    [maxBalls, maxSteps],
  )

  useFrame((state, delta) => {
    const material = raymarchMaterial.current
    if (!material) return

    const clamped = Math.min(delta, 0.05)
    const { pointer, reducedMotion, scrollProgress } = useGalleryStore.getState()
    const aspect = targetWidth / targetHeight

    const desired = ndcToBlobPlane(pointer.x, pointer.y, aspect, cameraDistance, focalLength)
    const current = smoothedPointer.current
    current.x = damp(current.x, desired.x, pointerDamping, clamped)
    current.y = damp(current.y, desired.y, pointerDamping, clamped)
    current.z = damp(current.z, desired.z, pointerDamping, clamped)

    writeMetaballs(ballData, metaballs, reducedMotion ? 0 : state.clock.elapsedTime, current, {
      idleMotion: reducedMotion ? 0 : idleMotion,
      idleSpeed,
      pointerStrength: reducedMotion ? 0 : pointerStrength,
      pointerRadius,
      scrollProgress,
      scrollSpread,
      scrollDrift,
    })

    const uniforms = material.uniforms
    uniforms.uCount.value = metaballs.length
    uniforms.uSmoothness.value = smoothness
    uniforms.uResolution.value.set(targetWidth, targetHeight)
    uniforms.uCameraPos.value.set(0, 0, cameraDistance)
    uniforms.uFocalLength.value = focalLength
    uniforms.uMaxDistance.value = maxDistance
    uniforms.uSurfaceEpsilon.value = surfaceEpsilon
    uniforms.uEdgeSoftness.value = edgeSoftness
    uniforms.uEnvIntensity.value = envIntensity
    uniforms.uFresnelPower.value = fresnelPower
    uniforms.uLightIntensity.value = lightIntensity
    uniforms.uSpecularSharpness.value = specularSharpness

    if (compositeMaterial.current) {
      const composite = compositeMaterial.current.uniforms
      composite.uTexelSize.value.set(1 / targetWidth, 1 / targetHeight)
      composite.uBlurAmount.value = blur
      composite.uOpacity.value = opacity
    }

    const previousTarget = state.gl.getRenderTarget()
    state.gl.setRenderTarget(fbo)
    state.gl.setClearColor(0x000000, 0)
    state.gl.clear(true, true, false)
    state.gl.render(blobScene, blobCamera)
    state.gl.setRenderTarget(previousTarget)
  }, -1)

  useEffect(() => {
    const scene = blobScene
    const target = fbo

    return () => {
      scene.traverse((object) => {
        if (!(object instanceof THREE.Mesh)) return
        object.geometry?.dispose()
        const material = object.material
        if (Array.isArray(material)) material.forEach((entry) => entry.dispose())
        else material?.dispose()
      })
      scene.clear()
      target.dispose()
    }
  }, [blobScene, fbo])

  return (
    <>
      {createPortal(
        <mesh frustumCulled={false}>
          <planeGeometry args={[2, 2]} />
          <shaderMaterial
            key={`${maxBalls}-${maxSteps}`}
            ref={raymarchMaterial}
            vertexShader={raymarchVert}
            fragmentShader={raymarchFrag}
            uniforms={raymarchUniforms}
            defines={defines}
            transparent
            depthTest={false}
            depthWrite={false}
          />
        </mesh>,
        blobScene,
      )}

      <mesh frustumCulled={false} renderOrder={-10}>
        <planeGeometry args={[2, 2]} />
        <shaderMaterial
          ref={compositeMaterial}
          vertexShader={compositeVert}
          fragmentShader={compositeFrag}
          uniforms={compositeUniforms}
          transparent
          depthTest={false}
          depthWrite={false}
        />
      </mesh>
    </>
  )
}
