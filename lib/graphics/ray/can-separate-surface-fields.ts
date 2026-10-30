import { getPrimitiveCapsuleField } from "./get-primitive-capsule-field"
import { getConeSeparationField } from "./get-cone-separation-field"
import { certifyFieldSeparation, type BoundedField } from "../../engine/field-separation"
import type { SurfaceSeparationContext as Props } from "./surface-separation-types"

/** 囲いで未確定の組だけを、既存の表面・円錐・距離場の順序で細分して照合する。 */
export function canSeparateSurfaceFields(props: Props): boolean {
  const moving: BoundedField = {
    min: [props.surface.bounds.min[0] - props.margin, props.surface.bounds.min[1] - props.margin, props.surface.bounds.min[2] - props.margin],
    max: [props.surface.bounds.max[0] + props.margin, props.surface.bounds.max[1] + props.margin, props.surface.bounds.max[2] + props.margin],
    value: props.surface.sd,
    lipschitz: 1,
    level: props.margin,
  }
  const fields = props.primitive.separationFields?.()
  if (fields?.length && fields.every((field) => certifyFieldSeparation(moving, field))) return true
  const cone = getConeSeparationField(props.primitive)
  if (cone) return certifyFieldSeparation(moving, cone)
  if (props.primitive.sd && props.primitive.sdLipschitz) return certifyFieldSeparation(moving, { ...props.bounds, value: props.primitive.sd, lipschitz: props.primitive.sdLipschitz })
  if (certifyFieldSeparation(moving, getPrimitiveCapsuleField(props.primitive))) return true
  return props.boxes.every((box) => certifyFieldSeparation(moving, { ...box, value: () => 0, lipschitz: 1 }))
}
