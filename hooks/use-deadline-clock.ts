import { useEffect, useState } from "react"

/** Updates while a displayed deadline is pending; no timer once it expires. */
export function useDeadlineClock(until: number, interval = 1000) {
  const [now, setNow] = useState(() => Date.now())
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | undefined
    const tick = () => {
      const current = Date.now()
      setNow(current)
      if (current < until) timer = setTimeout(tick, Math.min(interval, until - current))
    }
    tick()
    return () => clearTimeout(timer)
  }, [until, interval])
  return Math.max(now, Date.now())
}
