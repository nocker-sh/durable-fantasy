import { certifyFieldSeparation } from "../../engine/field-separation"
import { primitiveBounds } from "./primitive-bounds"
import { getConeSeparationField } from "./get-cone-separation-field"
import { getPrimitiveCapsuleField } from "./get-primitive-capsule-field"
import type { BoundedField } from "../../engine/field-separation"
import type { Primitive } from "./primitive-types"
type Props = { fields: readonly BoundedField[]; primitive: Primitive }

/** Every filled component needs a proof; uncertain native surfaces remain collisions rather than being sampled away. */
export function canSeparateFieldsFromPrimitive(props: Props): boolean {
  if (!props.fields.length) return false
  const cone = getConeSeparationField(props.primitive)
  if (cone) return props.fields.every((field) => certifyFieldSeparation(field, cone))
  const primitive = props.primitive
  if (primitive.sd && primitive.sdLipschitz) {
    const fixed = { ...primitiveBounds(primitive), value: primitive.sd, lipschitz: primitive.sdLipschitz }
    return props.fields.every((field) => certifyFieldSeparation(field, fixed))
  }

  return props.fields.every((field) => certifyFieldSeparation(field, getPrimitiveCapsuleField(primitive)))
}
