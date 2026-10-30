import { isFiniteOrderedBounds } from "#/lib/engine/is-finite-ordered-bounds"
import { primitiveBounds } from "#/lib/graphics/ray/primitive-bounds"
import { getPrimitiveCapsuleBounds } from "#/lib/graphics/ray/get-primitive-capsule-bounds"
import { getPrimitiveCapsuleField } from "#/lib/graphics/ray/get-primitive-capsule-field"
import { getConeSeparationField } from "#/lib/graphics/ray/get-cone-separation-field"
import { segmentCuboidDistance } from "#/lib/engine/segment-cuboid-distance"
import { certifyFieldSeparation } from "#/lib/engine/field-separation"
import type { Cuboid } from "#/lib/engine/cuboid-subtraction"
import type { BoundedField } from "#/lib/engine/field-separation"
import type { Primitive } from "#/lib/graphics/ray/primitive-types"
type Props = { primitive: Primitive; box: Cuboid }

/** Refine conservative envelopes without assigning an invented Lipschitz constant to a native surface. */
export function canSeparatePrimitiveFromCuboid(props: Props): boolean {
  const box = props.box,
    primitive = props.primitive
  if (![box.x0, box.x1, box.bottom, box.top, box.z0, box.z1].every(Number.isFinite) || box.x0 >= box.x1 || box.bottom >= box.top || box.z0 >= box.z1) return false
  const bounds = primitiveBounds(primitive)
  if (!isFiniteOrderedBounds(bounds)) return false
  if (bounds.max[0] < box.x0 || bounds.min[0] > box.x1 || bounds.max[1] < box.bottom || bounds.min[1] > box.top || bounds.max[2] < box.z0 || bounds.min[2] > box.z1) return true
  if (getPrimitiveCapsuleBounds(primitive).every((capsule) => segmentCuboidDistance(box, capsule.a, capsule.b) >= capsule.r)) return true
  const obstacle: BoundedField = { min: [box.x0, box.bottom, box.z0], max: [box.x1, box.top, box.z1], value: () => 0, lipschitz: 1 }
  const fields = primitive.separationFields?.()
  if (fields?.length && fields.every((field) => certifyFieldSeparation(field, obstacle))) return true
  const cone = getConeSeparationField(primitive)
  if (cone && certifyFieldSeparation(cone, obstacle)) return true
  if (primitive.sd && primitive.sdLipschitz && certifyFieldSeparation({ ...bounds, value: primitive.sd, lipschitz: primitive.sdLipschitz }, obstacle)) return true
  if (certifyFieldSeparation(getPrimitiveCapsuleField(primitive), obstacle)) return true
  const boxes = primitive.boxBounds?.()

  return Boolean(boxes?.length && boxes.every((part) => certifyFieldSeparation({ ...part, value: () => 0, lipschitz: 1 }, obstacle)))
}
