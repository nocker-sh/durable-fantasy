import { limbSd } from "#/lib/graphics/ray/limb-sd"
import { subtractVector3 as sub } from "../../../lib/engine/subtract-vector3"
import type { Vector3Tuple as V3 } from "../../../lib/engine/vector3-types"
type Props = { points: V3[]; radii: number[]; supportY: number }

/** A resting trouser thigh flattens at its support plane; the lower leg retains its complete round profile. */
export function getSupportedThighField(props: Props) {
  if (
    props.points.length !== 3 ||
    props.radii.length !== 3 ||
    !Number.isFinite(props.supportY) ||
    !props.points.flat().every(Number.isFinite) ||
    props.radii.some((radius) => !Number.isFinite(radius) || radius <= 0)
  )
    return new Error("Invalid supported trouser profile")
  if (props.points.slice(1).some((point, index) => Math.hypot(...sub(point, props.points[index])) <= Math.abs(props.radii[index + 1] - props.radii[index])))
    return new Error("Collapsed supported trouser segment")
  const original = limbSd(props.points, props.radii)
  if (!Number.isFinite(original.r) || ![...original.bounds.min, ...original.bounds.max].every(Number.isFinite)) return new Error("Unbounded supported trouser profile")
  const thigh = limbSd(props.points.slice(0, 2), props.radii.slice(0, 2))
  const shin = limbSd(props.points.slice(1), props.radii.slice(1))
  if (props.supportY >= thigh.bounds.max[1]) return new Error("Support plane removes the complete thigh")

  const supportedBounds = { min: [thigh.bounds.min[0], Math.max(thigh.bounds.min[1], props.supportY), thigh.bounds.min[2]] satisfies V3, max: thigh.bounds.max }

  return { ...original, boxBounds: () => [supportedBounds, shin.bounds], sd: (point: V3) => Math.min(Math.max(thigh.sd(point), props.supportY - point[1]), shin.sd(point)) }
}
