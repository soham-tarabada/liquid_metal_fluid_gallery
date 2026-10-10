import type Lenis from 'lenis'

let instance: Lenis | null = null

export const setLenis = (next: Lenis | null) => {
  instance = next
}

export const getLenis = (): Lenis | null => instance

export const lockScroll = () => instance?.stop()

export const unlockScroll = () => instance?.start()
