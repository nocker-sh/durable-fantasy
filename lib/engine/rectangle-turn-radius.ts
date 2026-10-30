import type { Rect } from "#/lib/engine/rectangle-motion-types"
/** Radius about the reference point, including asymmetric held loads. */
export function rectangleTurnRadius(relative: Rect): number {
  return Math.max(Math.hypot(relative[0], relative[1]), Math.hypot(relative[0], relative[3]), Math.hypot(relative[2], relative[1]), Math.hypot(relative[2], relative[3]))
}
