import { useLayoutEffect, useRef } from "react"
import type React from "react"

/** Keep a log scrolled to the newest line unless the reader has scrolled up. */
export function useStick(length: number) {
  const log = useRef<HTMLDivElement>(null)
  const stick = useRef(true)
  useLayoutEffect(() => {
    if (stick.current && log.current) log.current.scrollTop = log.current.scrollHeight
  }, [length])
  const onScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const el = e.currentTarget
    stick.current = el.scrollHeight - el.scrollTop - el.clientHeight < 8
  }
  return { log, onScroll }
}
