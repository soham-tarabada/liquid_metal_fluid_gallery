import gsap from 'gsap'
import { useEffect, useRef, type RefObject } from 'react'

type DragMorphOptions = {
  getBacking: () => HTMLElement | null
  disabled?: boolean
}

const DRAG_THRESHOLD = 6

export function useDragMorph(
  ref: RefObject<HTMLElement | null>,
  { getBacking, disabled = false }: DragMorphOptions,
) {
  const wasDragged = useRef(false)

  useEffect(() => {
    const element = ref.current
    if (!element || disabled) return

    const moveX = gsap.quickTo(element, 'x', { duration: 0.35, ease: 'power3' })
    const moveY = gsap.quickTo(element, 'y', { duration: 0.35, ease: 'power3' })

    let activePointer: number | null = null
    let startX = 0
    let startY = 0

    const settle = () => {
      moveX(0)
      moveY(0)

      const backing = getBacking()
      if (backing) {
        gsap.to(backing, {
          x: 0,
          y: 0,
          rotation: 0,
          scaleX: 1,
          scaleY: 1,
          duration: 0.9,
          ease: 'elastic.out(1, 0.55)',
          overwrite: 'auto',
        })
      }
    }

    const onPointerDown = (event: PointerEvent) => {
      if (event.pointerType !== 'mouse' || event.button !== 0) return
      activePointer = event.pointerId
      startX = event.clientX
      startY = event.clientY
      wasDragged.current = false
      element.setPointerCapture(event.pointerId)
    }

    const onPointerMove = (event: PointerEvent) => {
      if (activePointer !== event.pointerId) return

      const dx = event.clientX - startX
      const dy = event.clientY - startY
      const magnitude = Math.hypot(dx, dy)

      if (magnitude > DRAG_THRESHOLD) wasDragged.current = true

      moveX(dx * 0.16)
      moveY(dy * 0.16)

      const backing = getBacking()
      if (!backing) return

      gsap.to(backing, {
        x: dx * 0.34,
        y: dy * 0.34,
        rotation: (Math.atan2(dy, dx) * 180) / Math.PI,
        scaleX: 1 + Math.min(magnitude / 620, 0.32),
        scaleY: 1 - Math.min(magnitude / 1400, 0.16),
        duration: 0.35,
        ease: 'power3',
        overwrite: 'auto',
      })
    }

    const onPointerUp = (event: PointerEvent) => {
      if (activePointer !== event.pointerId) return
      activePointer = null
      if (element.hasPointerCapture(event.pointerId)) {
        element.releasePointerCapture(event.pointerId)
      }
      settle()
    }

    const onClickCapture = (event: MouseEvent) => {
      if (!wasDragged.current) return
      event.preventDefault()
      event.stopPropagation()
      wasDragged.current = false
    }

    element.addEventListener('pointerdown', onPointerDown)
    element.addEventListener('pointermove', onPointerMove)
    element.addEventListener('pointerup', onPointerUp)
    element.addEventListener('pointercancel', onPointerUp)
    element.addEventListener('click', onClickCapture, true)

    return () => {
      element.removeEventListener('pointerdown', onPointerDown)
      element.removeEventListener('pointermove', onPointerMove)
      element.removeEventListener('pointerup', onPointerUp)
      element.removeEventListener('pointercancel', onPointerUp)
      element.removeEventListener('click', onClickCapture, true)
      gsap.killTweensOf(element)
      gsap.set(element, { x: 0, y: 0 })
      const backing = getBacking()
      if (backing) {
        gsap.killTweensOf(backing)
        gsap.set(backing, { x: 0, y: 0, rotation: 0, scaleX: 1, scaleY: 1 })
      }
    }
  }, [ref, getBacking, disabled])

  return wasDragged
}
