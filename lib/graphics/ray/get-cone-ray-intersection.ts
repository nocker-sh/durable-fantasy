import { getConeLocalRay } from "#/lib/graphics/ray/get-cone-local-ray"
import { getConeSideIntersection } from "#/lib/graphics/ray/get-cone-side-intersection"
import { getConeTopIntersection } from "#/lib/graphics/ray/get-cone-top-intersection"
import type { Vector3 } from "#/lib/engine/vector3-types"
import type { PrimitiveShape } from "#/lib/graphics/ray/primitive-types"

export function getConeRayIntersection(origin: Vector3, direction: Vector3, primitive: PrimitiveShape): number {
  const ray = getConeLocalRay(origin, direction, primitive)
  const side = getConeSideIntersection(ray)
  const top = getConeTopIntersection(ray)
  if (top > 0 && (side < 0 || top < side)) return top
  return side
}
