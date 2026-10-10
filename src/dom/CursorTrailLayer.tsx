import { motion, useMotionValue, useSpring, type MotionValue } from 'framer-motion'
import { useEffect, useState } from 'react'
import { subscribePointer } from '@/lib/pointerBus'

type TrailNodeSpec = {
  size: number
  stiffness: number
  damping: number
}

const TRAIL: TrailNodeSpec[] = [
  { size: 28, stiffness: 420, damping: 30 },
  { size: 24, stiffness: 320, damping: 27 },
  { size: 19, stiffness: 250, damping: 25 },
  { size: 14, stiffness: 195, damping: 23 },
  { size: 10, stiffness: 150, damping: 21 },
]

type TrailNodeProps = {
  sourceX: MotionValue<number>
  sourceY: MotionValue<number>
  index: number
}

function TrailNode({ sourceX, sourceY, index }: TrailNodeProps) {
  const spec = TRAIL[index]
  const config = { stiffness: spec.stiffness, damping: spec.damping, mass: 0.42 }
  const x = useSpring(sourceX, config)
  const y = useSpring(sourceY, config)

  return (
    <>
      <motion.div
        className="cursor-trail-blob absolute top-0 left-0 rounded-full bg-chrome-100"
        style={{
          x,
          y,
          width: spec.size,
          height: spec.size,
          marginLeft: -spec.size / 2,
          marginTop: -spec.size / 2,
        }}
      />
      {index + 1 < TRAIL.length ? (
        <TrailNode sourceX={x} sourceY={y} index={index + 1} />
      ) : null}
    </>
  )
}

export default function CursorTrailLayer() {
  const pointerX = useMotionValue(0)
  const pointerY = useMotionValue(0)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const unsubscribe = subscribePointer((x, y) => {
      pointerX.set(x)
      pointerY.set(y)
      setVisible(true)
    })

    const onLeave = () => setVisible(false)
    const onEnter = () => setVisible(true)

    document.addEventListener('pointerleave', onLeave)
    document.addEventListener('pointerenter', onEnter)

    return () => {
      unsubscribe()
      document.removeEventListener('pointerleave', onLeave)
      document.removeEventListener('pointerenter', onEnter)
      setVisible(false)
    }
  }, [pointerX, pointerY])

  return (
    <div
      aria-hidden="true"
      className={`goo-soft pointer-events-none fixed inset-0 z-50 transition-opacity duration-500 ease-liquid ${
        visible ? 'opacity-100' : 'opacity-0'
      }`}
    >
      <TrailNode sourceX={pointerX} sourceY={pointerY} index={0} />
    </div>
  )
}
