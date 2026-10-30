import { qfromTo } from "#/lib/engine/qfrom-to"
import { qrot } from "#/lib/engine/qrot"
import { solveTwoBoneAtHeight } from "#/lib/engine/solve-two-bone-at-height"
import type { Q } from "#/lib/engine/quaternion-types"
import type { Point3 } from "#/lib/engine/cuboid-motion-types"
type Props = { root: Point3; target: Point3; upper: number; lower: number; pole: Point3; normal: Point3 }

/** Fix the joint to the target's plane by rotating the existing fixed-height solve, retaining both sphere radii. */
export function solveTwoBoneOnPlane(props: Props): { joint: Point3; end: Point3 } | Error {
  const norm = Math.hypot(...props.normal)
  if (![...props.root, ...props.target, ...props.pole, ...props.normal, props.upper, props.lower, norm].every(Number.isFinite) || norm === 0 || props.upper <= 0 || props.lower <= 0)
    return new Error("Invalid two-bone plane")
  const rotation = qfromTo([...props.normal], [0, 1, 0]),
    inverse: Q = [-rotation[0], -rotation[1], -rotation[2], rotation[3]],
    target = qrot(rotation, props.target)
  const solved = solveTwoBoneAtHeight({ root: qrot(rotation, props.root), target: target, upper: props.upper, lower: props.lower, pole: qrot(rotation, props.pole), height: target[1] })
  if (!solved) return new Error("Two-bone plane is unreachable without stretching")
  const joint = qrot(inverse, solved.joint)
  if (!joint.every(Number.isFinite)) return new Error("Nonfinite two-bone plane solution")

  return { joint, end: props.target }
}
