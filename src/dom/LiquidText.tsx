import { useRef, type ReactNode } from 'react'
import { useInView } from '@/lib/useInView'

type LiquidTextProps = {
  children: ReactNode
  className?: string
  as?: 'span' | 'h1' | 'h2' | 'h3'
}

export function LiquidText({ children, className = '', as: Tag = 'span' }: LiquidTextProps) {
  const ref = useRef<HTMLElement>(null)
  const inView = useInView(ref, '10% 0px')

  return (
    <Tag
      ref={ref as never}
      className={`liquid-text ${inView ? '' : 'is-paused'} ${className}`}
    >
      {children}
    </Tag>
  )
}
