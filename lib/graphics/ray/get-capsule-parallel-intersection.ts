import { subtractVector3 } from "#/lib/engine/subtract-vector3"
import { getCapsuleEndEntry } from "#/lib/graphics/ray/get-capsule-end-entry"
import type { Vector3 } from "#/lib/engine/vector3-types"
import type { PrimitiveShape } from "#/lib/graphics/ray/primitive-types"

/** 平行な光線では端点の登録順を深度の順序と見なさず、二つの入口の手前を返す。 */
export function getCapsuleParallelIntersection(origin: Vector3, direction: Vector3, primitive: PrimitiveShape): number {
  const first = getCapsuleEndEntry(subtractVector3(origin, primitive.a), direction, primitive.r)
  const second = getCapsuleEndEntry(subtractVector3(origin, primitive.b), direction, primitive.r)
  if (first === null) return second ?? -1
  if (second === null) return first
  if (second < first) return second
  return first
}
