import { useRef, type ReactNode } from 'react'
import { useInteractionEnabled } from '@/lib/useInteractionEnabled'
import { useMagnetic } from '@/lib/useMagnetic'

type MagneticProps = {
  children: ReactNode
  className?: string
  radius?: number
  strength?: number
}

export function Magnetic({ children, className = '', radius, strength }: MagneticProps) {
  const ref = useRef<HTMLSpanElement>(null)
  const enabled = useInteractionEnabled()

  useMagnetic(ref, { radius, strength, disabled: !enabled })

  return (
    <span ref={ref} className={`inline-block ${className}`}>
      {children}
    </span>
  )
}
