import { Environment } from '@react-three/drei'
import { HDRI, type HdriName } from '@/scene/hdri'

type EnvironmentSetupProps = {
  map?: HdriName
  background?: boolean
  intensity?: number
  blurriness?: number
}

export function EnvironmentSetup({
  map = 'studioChrome',
  background = false,
  intensity = 1,
  blurriness = 0,
}: EnvironmentSetupProps) {
  return (
    <Environment
      files={HDRI[map]}
      background={background}
      environmentIntensity={intensity}
      backgroundBlurriness={blurriness}
      resolution={512}
    />
  )
}
