import { useEffect, useState } from 'react'
import { every } from './runtime'

const MAX_EXTRA = 0.05

export function useYieldTick(base: number, step = 0.0003, ms = 1200, enabled = true) {
  const [extra, setExtra] = useState(0)

  useEffect(() => {
    if (!enabled) {
      setExtra(0)
      return
    }
    return every(() => {
      setExtra((v) => (v + step > MAX_EXTRA ? MAX_EXTRA : v + step))
    }, ms)
  }, [step, ms, enabled])

  return enabled ? base + extra : base
}
