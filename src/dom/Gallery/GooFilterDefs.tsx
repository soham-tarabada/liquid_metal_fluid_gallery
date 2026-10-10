type GooVariant = {
  id: string
  deviation: number
  alphaGain: number
  alphaBias: number
  blendSource?: boolean
}

const VARIANTS: GooVariant[] = [
  { id: 'goo', deviation: 10, alphaGain: 20, alphaBias: -10 },
  { id: 'goo-soft', deviation: 6, alphaGain: 14, alphaBias: -7 },
  { id: 'goo-strong', deviation: 16, alphaGain: 26, alphaBias: -13 },
  { id: 'goo-crisp', deviation: 10, alphaGain: 20, alphaBias: -10, blendSource: true },
]

const alphaRow = (gain: number, bias: number) =>
  `1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 ${gain} ${bias}`

export function GooFilterDefs() {
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      className="absolute h-0 w-0 overflow-hidden"
      style={{ position: 'absolute', width: 0, height: 0 }}
    >
      <defs>
        {VARIANTS.map(({ id, deviation, alphaGain, alphaBias, blendSource }) => (
          <filter
            key={id}
            id={id}
            x="-50%"
            y="-50%"
            width="200%"
            height="200%"
            colorInterpolationFilters="sRGB"
          >
            <feGaussianBlur in="SourceGraphic" stdDeviation={deviation} result="blurred" />
            <feColorMatrix
              in="blurred"
              mode="matrix"
              values={alphaRow(alphaGain, alphaBias)}
              result="gooed"
            />
            {blendSource ? (
              <feBlend in="SourceGraphic" in2="gooed" />
            ) : (
              <feComposite in="gooed" in2="gooed" operator="atop" />
            )}
          </filter>
        ))}
      </defs>
    </svg>
  )
}
