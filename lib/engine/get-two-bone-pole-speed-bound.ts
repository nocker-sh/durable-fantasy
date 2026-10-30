import { twoBoneSegmentReach } from "#/lib/engine/two-bone-segment-reach"
import type { Point3 } from "#/lib/engine/cuboid-motion-types"
type Props = { root: Point3; target: Point3; upper: number; lower: number; from: Point3; to: Point3 }

/** A fixed grip makes the elbow rotate in one plane; refuse pole paths crossing the solver's singular projection. */
export function getTwoBonePoleSpeedBound(props: Props): number | null | Error {
  if (![...props.root, ...props.target, ...props.from, ...props.to, props.upper, props.lower].every(Number.isFinite) || props.upper <= 0 || props.lower <= 0)
    return new Error("Invalid two-bone pole motion")
  if (!twoBoneSegmentReach({ root: props.root, from: props.target, to: props.target, upper: props.upper, lower: props.lower })) return null
  const delta = props.target.map((value, axis) => value - props.root[axis]),
    distance = Math.hypot(...delta)
  if (distance === 0) return null
  const direction = delta.map((value) => value / distance)
  const from = props.from.map((value, axis) => value - props.root[axis]),
    to = props.to.map((value, axis) => value - props.root[axis])
  const dotFrom = from.reduce((sum, value, axis) => sum + value * direction[axis], 0),
    dotTo = to.reduce((sum, value, axis) => sum + value * direction[axis], 0)
  const projected = from.map((value, axis) => value - direction[axis] * dotFrom)
  const velocity = to.map((value, axis) => value - direction[axis] * dotTo - projected[axis]),
    speed = Math.hypot(...velocity)
  const squared = velocity.reduce((sum, value) => sum + value * value, 0)
  const t = squared ? Math.max(0, Math.min(1, -projected.reduce((sum, value, axis) => sum + value * velocity[axis], 0) / squared)) : 0
  const minimum = Math.hypot(...projected.map((value, axis) => value + velocity[axis] * t))
  const uncertainty = Number.EPSILON * (Math.hypot(...from) + Math.hypot(...to)) * 32
  if (!Number.isFinite(minimum) || minimum <= 1e-12 + uncertainty) return null
  if (speed === 0) return 0
  const bound = (props.upper * speed) / (minimum - uncertainty)

  return Number.isFinite(bound) ? bound * (1 + 1e-12) + 1e-12 : null
}
