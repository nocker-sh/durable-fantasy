import { lerpVector3 } from "#/lib/engine/lerp-vector3"
import type { Vector3Tuple } from "#/lib/engine/vector3-types"
import type { PrimitiveBounds } from "#/lib/graphics/ray/primitive-bounds-types"

/** Preserve the exact joint-sphere envelope while avoiding separate temporary arrays for every bound axis. */
export function getLimbEnvelope(points: readonly Vector3Tuple[], radii: readonly number[]) {
  const c = lerpVector3(points[0], points[points.length - 1], 0.5)
  const bounds: PrimitiveBounds = { min: [Infinity, Infinity, Infinity], max: [-Infinity, -Infinity, -Infinity] }
  const envelope = { c, r: -Infinity, bounds }
  for (const index of points.keys()) {
    const point = points[index],
      radius = radii[index]
    envelope.r = Math.max(envelope.r, Math.hypot(point[0] - c[0], point[1] - c[1], point[2] - c[2]) + radius)
    for (const axis of [0, 1, 2]) {
      bounds.min[axis] = Math.min(bounds.min[axis], point[axis] - radius)
      bounds.max[axis] = Math.max(bounds.max[axis], point[axis] + radius)
    }
  }
  return { c, r: envelope.r + 0.01, bounds }
}
