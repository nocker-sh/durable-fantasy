import { armGripPoint } from "#/world/scene/figure/arm-grip-point"
import { nativeArmSurfaces } from "#/world/scene/figure/native-arm-surfaces"
import { subtractVector3 as sub } from "../../../lib/engine/subtract-vector3"
import type { Skel, HandGrip } from "#/world/scene/rig"
import type { WaterVesselPart } from "#/world/town/get-water-vessel-parts"
type Props = { skeleton: Skel; hand: "l" | "r"; bar: Extract<WaterVesselPart, { kind: "capsule" }>; bodyScale: number }

/** The opening encloses this bar, including the solved joint's numerical offset; it does not alter the forearm or cuff. */
export function getWaterHandleGripProfile(props: Props): HandGrip | Error {
  const bar = props.bar,
    joints = props.skeleton.p,
    elbow = joints[`lowerarm_${props.hand}`],
    wrist = joints[`hand_${props.hand}`]
  if (
    !Number.isFinite(props.bodyScale) ||
    props.bodyScale <= 0 ||
    bar.section !== "grip" ||
    bar.side !== props.hand ||
    bar.from[0] !== bar.to[0] ||
    bar.from[2] !== bar.to[2] ||
    bar.from[1] >= bar.to[1] ||
    ![...bar.from, ...bar.to, bar.radius].every(Number.isFinite) ||
    bar.radius <= 0
  )
    return new Error("Invalid vertical water handle grip bar")
  const centre = armGripPoint(elbow, wrist),
    raw = nativeArmSurfaces({ scale: props.bodyScale, shoulder: joints[`upperarm_${props.hand}`], elbow: elbow, wrist: wrist })
  const halfWidth = Math.max(Math.abs(bar.from[0] - centre[0]), Math.abs(bar.to[0] - centre[0])) + bar.radius,
    halfDepth = Math.max(Math.abs(bar.from[2] - centre[2]), Math.abs(bar.to[2] - centre[2])) + bar.radius
  const core = raw.palm.radius - Math.hypot(...sub(centre, raw.palm.centre))
  if (![halfWidth, halfDepth, core].every(Number.isFinite) || Math.hypot(halfWidth, halfDepth) >= core) return new Error("Water handle opening does not fit the native palm")

  return { axis: [0, 1, 0], across: [1, 0, 0], halfWidth, halfDepth }
}
