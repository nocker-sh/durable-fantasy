import { primitiveBounds } from "#/lib/graphics/ray/primitive-bounds"
import { dotVector3 as dot } from "#/lib/engine/dot-vector3"
import { normalizeVector3 as norm } from "#/lib/engine/normalize-vector3"
import { subtractVector3 as sub } from "#/lib/engine/subtract-vector3"
import { scaleVector3 as mul } from "#/lib/engine/scale-vector3"
import type { PrimitiveShape } from "#/lib/graphics/ray/primitive-types"
import type { BoundedField } from "#/lib/engine/field-separation"

/** A capped cone's radial inequality has a larger Lipschitz bound when its sides taper. */
export function getConeSeparationField(primitive: PrimitiveShape): BoundedField | null {
  if (primitive.kind !== "cone") return null
  const delta = sub(primitive.b, primitive.a),
    length = Math.hypot(...delta)
  if (!Number.isFinite(length) || length <= 0) return null
  const direction = norm(delta),
    slope = (primitive.r2 - primitive.r) / length

  return {
    ...primitiveBounds(primitive),
    lipschitz: Math.hypot(1, slope),
    value: (point) => {
      const relative = sub(point, primitive.a),
        along = dot(relative, direction)
      return Math.max(-along, along - length, Math.hypot(...sub(relative, mul(direction, along))) - primitive.r - slope * along)
    },
  }
}
