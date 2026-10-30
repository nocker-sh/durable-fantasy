import type { PrimitiveShape } from "./primitive-types"
import type { PrimitiveBounds } from "./primitive-bounds-types"
import { cylinderBounds } from "./cylinder-bounds"

export function primitiveBounds(primitive: PrimitiveShape): PrimitiveBounds {
  if (primitive.bounds) return primitive.bounds
  if (primitive.kind === "sdf")
    return {
      min: [primitive.a[0] - primitive.r, primitive.a[1] - primitive.r, primitive.a[2] - primitive.r],
      max: [primitive.a[0] + primitive.r, primitive.a[1] + primitive.r, primitive.a[2] + primitive.r],
    }
  if (primitive.kind === "sph") {
    const x = (primitive.sx ?? 1) * primitive.r,
      y = (primitive.sy ?? 1) * primitive.r,
      z = (primitive.sz ?? 1) * primitive.r
    return { min: [primitive.a[0] - x, primitive.a[1] - y, primitive.a[2] - z], max: [primitive.a[0] + x, primitive.a[1] + y, primitive.a[2] + z] }
  }
  const radius = Math.max(primitive.r, primitive.r2)
  if (primitive.kind === "cone") return cylinderBounds(primitive.a, primitive.b, radius)
  return {
    min: [Math.min(primitive.a[0], primitive.b[0]) - radius, Math.min(primitive.a[1], primitive.b[1]) - radius, Math.min(primitive.a[2], primitive.b[2]) - radius],
    max: [Math.max(primitive.a[0], primitive.b[0]) + radius, Math.max(primitive.a[1], primitive.b[1]) + radius, Math.max(primitive.a[2], primitive.b[2]) + radius],
  }
}
