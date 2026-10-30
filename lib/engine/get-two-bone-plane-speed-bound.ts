import { qfromTo } from "./qfrom-to"
import { qrot } from "./qrot"
import { twoBoneJointSpeedBound } from "./two-bone-joint-speed-bound"
import type { Point3 } from "./cuboid-motion-types"
type Props = { root: Point3; from: Point3; to: Point3; upper: number; lower: number; pole: Point3; normal: Point3 }

/** A fixed target plane reduces the moving chain to fixed-radius planar circles; drifting planes and singular branches remain unresolved. */
export function getTwoBonePlaneSpeedBound(props: Props): number | Error {
  const norm = Math.hypot(...props.normal),
    delta: Point3 = [props.to[0] - props.from[0], props.to[1] - props.from[1], props.to[2] - props.from[2]]
  if (
    ![...props.root, ...props.from, ...props.to, ...props.pole, ...props.normal, ...delta, props.upper, props.lower, norm].every(Number.isFinite) ||
    norm === 0 ||
    props.upper <= 0 ||
    props.lower <= 0
  )
    return new Error("Invalid two-bone plane interval")
  if (delta.reduce((sum, value, axis) => sum + value * props.normal[axis], 0) !== 0) return new Error("Moving joint plane has no fixed-plane speed bound")
  const rotation = qfromTo([...props.normal], [0, 1, 0]),
    root = qrot(rotation, props.root),
    from = qrot(rotation, props.from),
    to = qrot(rotation, props.to),
    pole = qrot(rotation, props.pole)
  const offset = props.root.reduce((sum, value, axis) => sum + (value - props.from[axis]) * (props.normal[axis] / norm), 0),
    radiusSquared = props.upper ** 2 - offset ** 2
  if (!Number.isFinite(radiusSquared) || radiusSquared <= 0) return new Error("Joint plane leaves no projected upper-link radius")
  const speed = twoBoneJointSpeedBound({
    root: [root[0], 0, root[2]],
    from: [from[0], 0, from[2]],
    to: [to[0], 0, to[2]],
    upper: Math.sqrt(radiusSquared),
    lower: props.lower,
    pole: [pole[0], 0, pole[2]],
  })
  if (speed === undefined || !Number.isFinite(speed)) return new Error("Joint plane interval has no certified speed")

  return speed
}
