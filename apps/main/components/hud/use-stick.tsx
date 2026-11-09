import { useCallback, useLayoutEffect, useRef } from "react"
import type React from "react"

/**
 * Keep a log scrolled to the newest line unless the reader has scrolled up. `newest` names the last
 * line: a full log drops its oldest line as each new one comes, so its length stops changing.
 */
export function useStick(newest: unknown) {
  const box = useRef<HTMLDivElement | null>(null)
  const stick = useRef(true)
  useLayoutEffect(() => {
    if (stick.current && box.current) box.current.scrollTop = box.current.scrollHeight
  }, [newest])
  // a box mounted again (reopened, unfolded, the layout reset) starts at the newest line, not the oldest
  const log = useCallback((element: HTMLDivElement | null) => {
    box.current = element
    if (!element) return
    stick.current = true
    element.scrollTop = element.scrollHeight
  }, [])
  const onScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const el = e.currentTarget
    stick.current = el.scrollHeight - el.scrollTop - el.clientHeight < 8
  }
  return { log, onScroll }
}
