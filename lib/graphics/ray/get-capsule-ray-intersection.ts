import { subtractVector3 } from "#/lib/engine/subtract-vector3"
import { getCapsuleRayCoefficients } from "#/lib/graphics/ray/get-capsule-ray-coefficients"
import { getCapsuleEndEntry } from "#/lib/graphics/ray/get-capsule-end-entry"
import { getCapsuleParallelIntersection } from "#/lib/graphics/ray/get-capsule-parallel-intersection"
import type { Vector3 } from "#/lib/engine/vector3-types"
import type { PrimitiveShape } from "#/lib/graphics/ray/primitive-types"

export function getCapsuleRayIntersection(origin: Vector3, direction: Vector3, primitive: PrimitiveShape): number {
  const ray = getCapsuleRayCoefficients(origin, direction, primitive)
  const discriminant = ray.linear * ray.linear - ray.quadratic * ray.constant
  if (discriminant >= 0 && ray.quadratic > 1e-9) {
    const distance = (-ray.linear - Math.sqrt(discriminant)) / ray.quadratic
    const height = ray.axisOrigin + distance * ray.axisDirection
    if (height > 0 && height < ray.axisLengthSquared) return distance
    const offset = height <= 0 ? ray.startOffset : subtractVector3(origin, primitive.b)
    return getCapsuleEndEntry(offset, direction, primitive.r) ?? -1
  }
  if (ray.quadratic <= 1e-9) return getCapsuleParallelIntersection(origin, direction, primitive)
  return -1
}
