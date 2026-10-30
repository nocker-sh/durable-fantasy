// A dev page's body, inside the one frame of pages/dev/layout.tsx. It draws in the browser only
// (icons and the game's code need one) and marks <body data-ready="1"> once it has drawn, so
// screenshots know when to fire.
import { useEffect, useState, type ReactNode } from "react"

/** A page's body, drawn once in the browser; `ready` false holds off the screenshot. */
export function DevPage(inputProps: { children: ReactNode | (() => ReactNode); ready?: boolean }) {
  const children = inputProps.children
  const readyValue = inputProps.ready
  const ready = readyValue === undefined ? true : readyValue

  const mountedState = useState(false),
    mounted = mountedState[0],
    setMounted = mountedState[1]
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
