// A dev page's body, inside the one frame of pages/dev/layout.tsx. It draws in the browser only
// (icons and the game's code need one) and marks <body data-ready="1"> once it has drawn, so
// screenshots know when to fire.
import { useEffect, useState, type ReactNode } from "react"

/** A page's body, drawn once in the browser; `ready` false holds off the screenshot. */
export function DevPage({ children, ready = true }: { children: ReactNode | (() => ReactNode); ready?: boolean }) {
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])
  useEffect(() => {
    if (!mounted) return
    document.body.dataset.ready = ready ? "1" : "0"
    return () => {
      delete document.body.dataset.ready
    }
  }, [ready, mounted])
  return mounted ? <>{typeof children === "function" ? children() : children}</> : null
}
