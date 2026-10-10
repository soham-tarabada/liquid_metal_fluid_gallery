import { useEffect } from 'react'
import { readDevFlags } from '@/lib/devFlags'
import { DISABLE_GOO_ON_WEBKIT, isWebkit } from '@/lib/gooMode'

export function useGooMode() {
  useEffect(() => {
    const root = document.documentElement
    const webkit = isWebkit()

    if (webkit) root.setAttribute('data-engine', 'webkit')

    const flag = readDevFlags().goo
    const disabled = flag === 'off' || (flag !== 'on' && webkit && DISABLE_GOO_ON_WEBKIT)

    root.setAttribute('data-goo', disabled ? 'off' : 'on')

    return () => {
      root.removeAttribute('data-goo')
      root.removeAttribute('data-engine')
    }
  }, [])
}
