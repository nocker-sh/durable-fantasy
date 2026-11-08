import { useEffect, useState } from "react"

/** Updates while a displayed deadline is pending; no timer once it expires. */
export function useDeadlineClock(until: number, interval = 1000) {
  const nowState = useState(() => Date.now()),
    now = nowState[0],
    setNow = nowState[1]
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
