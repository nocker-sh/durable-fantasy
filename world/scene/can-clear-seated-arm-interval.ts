import { solveArmGripPose } from "#/world/scene/figure/solve-arm-grip-pose"
import { twoBoneJointSpeedBound } from "../../lib/engine/two-bone-joint-speed-bound"
import { armGripLengths } from "#/world/scene/figure/arm-grip-lengths"
import { nativeArmMotionSpeed } from "#/world/scene/figure/native-arm-motion-speed"
import { createBodyContext } from "#/world/scene/figure/context"
import { getSeatedArmClearanceError } from "#/world/scene/get-seated-arm-clearance-error"
import type { Point3 } from "../../lib/engine/cuboid-motion-types"
type Props = Omit<Parameters<typeof getSeatedArmClearanceError>[0], "margin" | "movingHand"> & { hand: "l" | "r"; from: Point3; to: Point3; pole: Point3 }

/** A midpoint enclosure inflated by the joint-speed bound covers the entire straight-target interval. */
export function canClearSeatedArmInterval(props: Props): boolean {
  const lengths = armGripLengths(props.skeleton, props.hand)
  const jointSpeed = twoBoneJointSpeedBound({
    root: props.skeleton.p[`upperarm_${props.hand}`],
    from: props.from,
    to: props.to,
    upper: lengths.upper,
    lower: lengths.forearm + lengths.palm,
    pole: props.pole,
  })
  if (jointSpeed === undefined) return false
  const midpoint = [(props.from[0] + props.to[0]) / 2, (props.from[1] + props.to[1]) / 2, (props.from[2] + props.to[2]) / 2] satisfies [number, number, number]
  const posed = solveArmGripPose({ skeleton: props.skeleton, hand: props.hand, target: midpoint, pole: props.pole })
  if (posed instanceof Error) return false
  const scale = createBodyContext(props.look, props.skeleton, null).S
  const targetSpeed = Math.hypot(...props.to.map((value, axis) => value - props.from[axis]))
  const margin = nativeArmMotionSpeed({ scale: scale, forearm: lengths.forearm, palm: lengths.palm, elbowSpeed: jointSpeed, gripSpeed: targetSpeed }) / 2 + 1e-10

  return getSeatedArmClearanceError({ ...props, skeleton: posed.skeleton, margin, movingHand: props.hand }) === null
}
