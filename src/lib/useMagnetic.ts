import gsap from 'gsap'
import { useEffect, type RefObject } from 'react'
import { subscribePointer } from '@/lib/pointerBus'

type MagneticOptions = {
  radius?: number
  strength?: number
  disabled?: boolean
}

export function useMagnetic(
  ref: RefObject<HTMLElement | null>,
  { radius = 90, strength = 0.34, disabled = false }: MagneticOptions = {},
) {
  useEffect(() => {
    const element = ref.current
    if (!element || disabled) return

    const moveX = gsap.quickTo(element, 'x', { duration: 0.55, ease: 'power3' })
    const moveY = gsap.quickTo(element, 'y', { duration: 0.55, ease: 'power3' })

    let engaged = false

    const unsubscribe = subscribePointer((pointerX, pointerY) => {
      const rect = element.getBoundingClientRect()
      if (rect.width === 0 && rect.height === 0) return

      const centreX = rect.left + rect.width / 2
      const centreY = rect.top + rect.height / 2
      const dx = pointerX - centreX
      const dy = pointerY - centreY
      const reach = radius + Math.max(rect.width, rect.height) / 2

      if (Math.hypot(dx, dy) <= reach) {
        if (!engaged) {
          engaged = true
          element.style.willChange = 'transform'
        }
        moveX(dx * strength)
        moveY(dy * strength)
      } else if (engaged) {
        engaged = false
        moveX(0)
        moveY(0)
        window.setTimeout(() => {
          if (!engaged) element.style.willChange = ''
        }, 600)
      }
    })

    return () => {
      unsubscribe()
      gsap.killTweensOf(element)
      gsap.set(element, { x: 0, y: 0 })
      element.style.willChange = ''
    }
  }, [ref, radius, strength, disabled])
}
