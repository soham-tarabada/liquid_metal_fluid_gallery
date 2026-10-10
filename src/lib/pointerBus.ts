type PointerListener = (x: number, y: number) => void

const listeners = new Set<PointerListener>()

let attached = false
let frame = 0
let pendingX = 0
let pendingY = 0
let hasPending = false

const flush = () => {
  frame = 0
  if (!hasPending) return
  hasPending = false
  for (const listener of listeners) listener(pendingX, pendingY)
}

const onPointerMove = (event: PointerEvent) => {
  pendingX = event.clientX
  pendingY = event.clientY
  hasPending = true
  if (frame === 0) frame = requestAnimationFrame(flush)
}

const attach = () => {
  if (attached) return
  attached = true
  window.addEventListener('pointermove', onPointerMove, { passive: true })
}

const detach = () => {
  if (!attached) return
  attached = false
  window.removeEventListener('pointermove', onPointerMove)
  if (frame !== 0) {
    cancelAnimationFrame(frame)
    frame = 0
  }
}

export function subscribePointer(listener: PointerListener): () => void {
  listeners.add(listener)
  attach()

  return () => {
    listeners.delete(listener)
    if (listeners.size === 0) detach()
  }
}
