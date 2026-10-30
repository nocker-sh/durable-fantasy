import { dotVector3 as dot } from "../../engine/dot-vector3"
import { subtractVector3 as sub } from "../../engine/subtract-vector3"
import type { Vector3Tuple as V3 } from "../../engine/vector3-types"
import type { getOrthogonalFrame } from "./get-orthogonal-frame"
type Props = { from: V3; radiusFrom: number; compression: number; slope: number; frame: Exclude<ReturnType<typeof getOrthogonalFrame>, Error> }

/** The unscaled radial coordinate also locates the inner lining of a compressed shell. */
export function getFrustumRadialValue(props: Props, point: V3): number {
  const relative = sub(point, props.from),
    frame = props.frame

  return Math.hypot(dot(relative, frame.across), dot(relative, frame.up) / props.compression) - props.radiusFrom - props.slope * dot(relative, frame.axis)
}
