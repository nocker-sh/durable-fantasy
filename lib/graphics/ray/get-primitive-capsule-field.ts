import { getPrimitiveCapsuleBounds } from "#/lib/graphics/ray/get-primitive-capsule-bounds"
import { primitiveBounds } from "#/lib/graphics/ray/primitive-bounds"
import { segmentSegmentDistance3D } from "#/lib/engine/segment-segment-distance-3d"
import type { BoundedField } from "#/lib/engine/field-separation"
import type { PrimitiveShape } from "#/lib/graphics/ray/primitive-types"

/** Refine the moving surface against a conservative capsule union, never against an uncertified native field. */
export function getPrimitiveCapsuleField(primitive: PrimitiveShape): BoundedField {
  const capsules = getPrimitiveCapsuleBounds(primitive)

  return {
    ...primitiveBounds(primitive),
    lipschitz: 1,
    value: (point) => Math.min(...capsules.map((capsule) => segmentSegmentDistance3D({ firstStart: point, firstEnd: point, secondStart: capsule.a, secondEnd: capsule.b }) - capsule.r)),
  }
}
