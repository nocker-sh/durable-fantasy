import type { Layout } from "#/components/game/window"

/** Keep a window inside the screen: wholly when it fits, otherwise with its left edge and title bar in view. */
export const keep = (l: Layout, el: HTMLElement | null): Layout => {
  const w = el?.offsetWidth ?? l.w ?? 200
  const h = el?.offsetHeight ?? l.h ?? 32
  const maxX = Math.max(0, window.innerWidth - w)
  const maxY = Math.max(0, Math.min(window.innerHeight - h, window.innerHeight - 32))
  return {
    ...l,
    x: Math.round(Math.min(Math.max(l.x, 0), maxX)),
    y: Math.round(Math.min(Math.max(l.y, 0), maxY)),
  }
}
