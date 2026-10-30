import { armGripPoint } from "#/world/scene/figure/arm-grip-point"
import { nativeArmSurfaces } from "#/world/scene/figure/native-arm-surfaces"
import { crossVector3 as cross } from "#/lib/engine/cross-vector3"
import { dotVector3 as dot } from "#/lib/engine/dot-vector3"
import { normalizeVector3 as norm } from "#/lib/engine/normalize-vector3"
import { subtractVector3 as sub } from "#/lib/engine/subtract-vector3"
import type { Skel, HandGrip } from "#/world/scene/rig"
import type { RoundGripBar } from "#/world/scene/figure/round-grip-bar-types"
type Props = { skeleton: Skel; hand: "l" | "r"; bar: RoundGripBar; bodyScale: number }

/** Enclose a whole round bar in the existing palm core; changing its orientation never widens the forearm or cuff. */
export function getRoundBarGripProfile(props: Props): HandGrip | Error {
  const bar = props.bar,
    joints = props.skeleton.p,
    elbow = joints[`lowerarm_${props.hand}`],
    wrist = joints[`hand_${props.hand}`]
  if (![...bar.from, ...bar.to, bar.radius, props.bodyScale].every(Number.isFinite) || bar.radius <= 0 || props.bodyScale <= 0 || Math.hypot(...sub([...bar.to], [...bar.from])) === 0)
    return new Error("Invalid round grip bar")
  const centre = armGripPoint(elbow, wrist),
    raw = nativeArmSurfaces({ scale: props.bodyScale, shoulder: joints[`upperarm_${props.hand}`], elbow: elbow, wrist: wrist }),
    axis = norm(sub([...bar.to], [...bar.from])),
    across = norm(cross(axis, raw.direction)),
    normal = cross(across, axis)
  if (![...across, ...normal].every(Number.isFinite) || Math.hypot(...across) < 0.99) return new Error("Round grip bar has no palm cross-section")
  const extent = (direction: typeof axis) => Math.max(Math.abs(dot(sub([...bar.from], centre), direction)), Math.abs(dot(sub([...bar.to], centre), direction))) + bar.radius
  const halfWidth = extent(across),
    halfDepth = extent(normal),
    core = raw.palm.radius - Math.hypot(...sub(centre, raw.palm.centre))
  if (![halfWidth, halfDepth, core].every(Number.isFinite) || Math.hypot(halfWidth, halfDepth) >= core) return new Error("Round grip bar does not fit the native palm")

  return { axis, across, halfWidth, halfDepth }
}
