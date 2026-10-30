import type { Bounds as Props } from "./bounds-types"

/** 厚みのない面や点も許し、非有限の座標と逆向きの範囲だけを拒否する。 */
export function isFiniteOrderedBounds(bounds: Props): boolean {
  return bounds.min.every(Number.isFinite) && bounds.max.every(Number.isFinite) && bounds.min[0] <= bounds.max[0] && bounds.min[1] <= bounds.max[1] && bounds.min[2] <= bounds.max[2]
}
