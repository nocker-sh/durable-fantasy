import { getFrustumProfile } from "./get-frustum-profile"
import { getFrustumRadialValue } from "./get-frustum-radial-value"
import { getOrthogonalFrame } from "./get-orthogonal-frame"
import { dotVector3 as dot } from "../../engine/dot-vector3"
import { subtractVector3 as sub } from "../../engine/subtract-vector3"
import type { Vector3Tuple as V3 } from "../../engine/vector3-types"
type Props = Parameters<typeof getOrthogonalFrame>[0] & { radiusFrom: number; radiusTo: number; compression: number; shellThickness: number | null }

/** Compress only the cross-section; the scaled radial field keeps a certified gradient bound and open shell ends. */
export function getEllipticalFrustumField(props: Props) {
  const frame = getOrthogonalFrame(props)
  if (frame instanceof Error) return frame
  const profile = getFrustumProfile({ ...props, length: frame.length })
  if (profile instanceof Error) return profile
  const min: V3 = [0, 0, 0],
    max: V3 = [0, 0, 0]
  for (const axis of [0, 1, 2]) {
    const extent = Math.hypot(frame.across[axis], frame.up[axis] * props.compression)
    min[axis] = Math.min(props.from[axis] - extent * props.radiusFrom, props.to[axis] - extent * props.radiusTo)
    max[axis] = Math.max(props.from[axis] + extent * props.radiusFrom, props.to[axis] + extent * props.radiusTo)
  }
  if (![...min, ...max].every(Number.isFinite)) return new Error("Unbounded frustum extent")
  const radialValue = (point: V3) => getFrustumRadialValue({ ...props, frame, slope: profile.slope }, point)

  return {
    min,
    max,
    lipschitz: profile.lipschitz,
    radialValue,
    along: (point: V3) => dot(sub(point, props.from), frame.axis) / frame.length,
    value: (point: V3) => {
      const along = dot(sub(point, props.from), frame.axis),
        radial = radialValue(point)
      if (props.shellThickness === null) return Math.max(-along, along - frame.length, radial * props.compression)
      return Math.max(-along, along - frame.length, (Math.abs(radial + props.shellThickness) - props.shellThickness) * props.compression)
    },
  }
}
