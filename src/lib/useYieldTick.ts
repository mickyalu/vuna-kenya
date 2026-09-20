import { useEffect, useState } from 'react'

export function useYieldTick(base: number, step = 0.0003, ms = 1200) {
  const [extra, setExtra] = useState(0)

  useEffect(() => {
    const id = window.setInterval(() => {
      setExtra((v) => v + step)
    }, ms)
    return () => window.clearInterval(id)
  }, [step, ms])

  return base + extra
}
