import type { Vector3Tuple as V3 } from "#/lib/engine/vector3-types"
import type { PrimitiveBounds } from "#/lib/graphics/ray/primitive-bounds-types"

/** The two axial end planes clip the radial cylinder; no spherical end caps. */
export function cylinderBounds(a: V3, b: V3, radius: number): PrimitiveBounds {
  const delta: V3 = [b[0] - a[0], b[1] - a[1], b[2] - a[2]]
  const length = Math.hypot(...delta)
  const extent = (value: number) => radius * (length ? Math.sqrt(Math.max(0, 1 - (value / length) ** 2)) : 1)
  const x = extent(delta[0]),
    y = extent(delta[1]),
    z = extent(delta[2])
  return { min: [Math.min(a[0], b[0]) - x, Math.min(a[1], b[1]) - y, Math.min(a[2], b[2]) - z], max: [Math.max(a[0], b[0]) + x, Math.max(a[1], b[1]) + y, Math.max(a[2], b[2]) + z] }
}
