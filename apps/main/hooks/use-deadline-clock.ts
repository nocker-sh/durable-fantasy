import { useEffect, useState } from "react"
import { useGameState } from "#/hooks/use-game-state"
import { serverNow } from "#/world/client/server-now"

/** Updates while a displayed deadline is pending; no timer once it expires. Deadlines and the time returned are the server's clock. */
export function useDeadlineClock(until: number, interval = 1000) {
  const clockOffset = useGameState((s) => s.clockOffset)
  const localState = useState(() => Date.now()),
    local = localState[0],
    setLocal = localState[1]
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | undefined
    const tick = () => {
      const current = Date.now()
      setLocal(current)
      const left = until - serverNow({ clockOffset }, current)
      if (left > 0) timer = setTimeout(tick, Math.min(interval, left))
    }
    tick()
    return () => clearTimeout(timer)
  }, [until, interval, clockOffset])
  return serverNow({ clockOffset }, Math.max(local, Date.now()))
}
