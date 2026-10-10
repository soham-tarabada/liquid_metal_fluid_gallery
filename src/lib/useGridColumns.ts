import { useEffect, useState, type RefObject } from 'react'

export function useGridColumns(ref: RefObject<HTMLElement | null>): number {
  const [columns, setColumns] = useState(1)

  useEffect(() => {
    const element = ref.current
    if (!element) return

    const measure = () => {
      const template = window.getComputedStyle(element).gridTemplateColumns
      const count = template.split(' ').filter(Boolean).length
      setColumns(Math.max(1, count))
    }

    measure()

    const observer = new ResizeObserver(measure)
    observer.observe(element)

    return () => observer.disconnect()
  }, [ref])

  return columns
}
