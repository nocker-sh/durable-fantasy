import type { Layout } from "#/components/game/window"

export const keep = (l: Layout, el: HTMLElement | null): Layout => {
  const w = el?.offsetWidth ?? l.w ?? 200
  return {
    ...l,
    x: Math.round(Math.min(Math.max(l.x, 80 - w), window.innerWidth - 80)),
    y: Math.round(Math.min(Math.max(l.y, 0), window.innerHeight - 32)),
  }
}
