import { useCallback, useEffect, useState, type RefObject } from 'react'

export type TileRect = {
  left: number
  top: number
  width: number
  height: number
}

export function useTileRects(
  containerRef: RefObject<HTMLElement | null>,
  selector: string,
  dependency: unknown,
): TileRect[] {
  const [rects, setRects] = useState<TileRect[]>([])

  const measure = useCallback(() => {
    const container = containerRef.current
    if (!container) return

    const base = container.getBoundingClientRect()
    const next: TileRect[] = []

    container.querySelectorAll<HTMLElement>(selector).forEach((tile) => {
      const rect = tile.getBoundingClientRect()
      next.push({
        left: rect.left - base.left,
        top: rect.top - base.top,
        width: rect.width,
        height: rect.height,
      })
    })

    setRects((previous) => {
      if (previous.length !== next.length) return next
      const changed = next.some((rect, index) => {
        const old = previous[index]
        return (
          Math.abs(old.left - rect.left) > 0.5 ||
          Math.abs(old.top - rect.top) > 0.5 ||
          Math.abs(old.width - rect.width) > 0.5 ||
          Math.abs(old.height - rect.height) > 0.5
        )
      })
      return changed ? next : previous
    })
  }, [containerRef, selector])

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    measure()

    const observer = new ResizeObserver(measure)
    observer.observe(container)
    container.querySelectorAll<HTMLElement>(selector).forEach((tile) => observer.observe(tile))

    window.addEventListener('resize', measure, { passive: true })

    return () => {
      observer.disconnect()
      window.removeEventListener('resize', measure)
    }
  }, [containerRef, measure, selector, dependency])

  return rects
}
