import { dotVector3 as dot } from "#/lib/engine/dot-vector3"
import { subtractVector3 as sub } from "#/lib/engine/subtract-vector3"
import type { Vector3Tuple as V3 } from "#/lib/engine/vector3-types"
import type { getOrthogonalFrame } from "#/lib/graphics/ray/get-orthogonal-frame"
type Props = { from: V3; radiusFrom: number; compression: number; slope: number; frame: Exclude<ReturnType<typeof getOrthogonalFrame>, Error> }

/** The unscaled radial coordinate also locates the inner lining of a compressed shell. */
export function getFrustumRadialValue(props: Props, point: V3): number {
  const relative = sub(point, props.from),
    frame = props.frame

  return Math.hypot(dot(relative, frame.across), dot(relative, frame.up) / props.compression) - props.radiusFrom - props.slope * dot(relative, frame.axis)
}
