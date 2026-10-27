import { useEffect, useState } from "react"

/** One-second updates while a displayed deadline is pending; no timer once it expires. */
export function useDeadlineClock(until: number) {
  const [now, setNow] = useState(() => Date.now())
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | undefined
    const tick = () => {
      const current = Date.now()
      setNow(current)
      if (current < until) timer = setTimeout(tick, Math.min(1000, until - current))
    }
    tick()
    return () => clearTimeout(timer)
  }, [until])
  return Math.max(now, Date.now())
}
