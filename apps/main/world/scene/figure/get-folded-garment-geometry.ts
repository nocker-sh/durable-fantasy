import { getEllipticalFrustumField } from "#/lib/graphics/ray/get-elliptical-frustum-field"
import { getUnionFieldPrimitive } from "#/lib/graphics/ray/get-union-field-primitive"
import { getFoldedGarmentMaterialCoordinates } from "#/world/scene/figure/get-folded-garment-material-coordinates"
import { addVector3 as add } from "#/lib/engine/add-vector3"
import { subtractVector3 as sub } from "#/lib/engine/subtract-vector3"
import { scaleVector3 as mul } from "#/lib/engine/scale-vector3"
import { normalizeVector3 as norm } from "#/lib/engine/normalize-vector3"
import { lerpVector3 as lerp3 } from "#/lib/engine/lerp-vector3"
import type { Vector3Tuple as V3 } from "#/lib/engine/vector3-types"
type Props = {
  hem: V3
  waist: V3
  hip: V3
  knees: V3
  fold: number
  radius: number
  waistRadius: number
  supportDepth: number
  shellThickness: number | null
  along: (point: V3, from: V3, to: V3) => number
}

/** Move the lower fabric span onto the thighs while retaining its length and hem width, without cutting out a chair box. */
export function getFoldedGarmentGeometry(props: Props) {
  if (!Number.isFinite(props.fold) || props.fold <= 0 || props.fold > 1) return new Error("Invalid folded garment phase")
  const join = lerp3(props.hem, props.hip, props.fold),
    forward = norm([props.knees[0] - props.hip[0], 0, props.knees[2] - props.hip[2]])
  const length = Math.hypot(...sub(props.hem, props.hip)) * props.fold,
    end = add(join, mul(forward, length))
  const radius = props.radius + (props.waistRadius - props.radius) * Math.max(0, Math.min(1, props.along(join, props.hem, props.waist)))
  const common = { acrossHint: [1, 0, 0] satisfies V3, shellThickness: props.shellThickness, radiusFrom: radius }
  const waist = getEllipticalFrustumField({ ...common, from: join, to: props.waist, radiusTo: props.waistRadius, compression: 1 })
  if (waist instanceof Error) return waist
  const lap = getEllipticalFrustumField({ ...common, from: join, to: end, radiusTo: props.radius, compression: (props.supportDepth / props.radius) * props.fold })
  if (lap instanceof Error) return lap
  const shape = getUnionFieldPrimitive([waist, lap])
  if (shape instanceof Error) return shape

  return { shape, forward, join, ...getFoldedGarmentMaterialCoordinates({ waist, lap, waistLength: Math.hypot(...sub(props.waist, join)), lapLength: length }) }
}
