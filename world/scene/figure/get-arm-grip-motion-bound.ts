import { twoBoneJointSpeedBound } from "#/lib/engine/two-bone-joint-speed-bound"
import { armGripLengths } from "#/world/scene/figure/arm-grip-lengths"
import { getNativeArmMotionBound } from "#/world/scene/figure/get-native-arm-motion-bound"
import { createBodyContext } from "#/world/scene/figure/context"
import type { Skel } from "#/world/scene/rig"
import type { Look } from "#/world/scene/figure/look"
import type { Point3 } from "#/lib/engine/cuboid-motion-types"
type Props = { look: Look; skeleton: Skel; hand: "l" | "r"; from: Point3; to: Point3; pole: Point3 }

/** Bounds are speeds over normalized segment time; both native sleeves and uncut palms stay enclosed. */
export function getArmGripMotionBound(props: Props) {
  const lengths = armGripLengths(props.skeleton, props.hand),
    scale = createBodyContext(props.look, props.skeleton, null).S
  if (
    ![...props.from, ...props.to, ...props.pole, ...props.skeleton.p[`upperarm_${props.hand}`], lengths.upper, lengths.forearm, lengths.palm, scale].every(Number.isFinite) ||
    Math.min(lengths.upper, lengths.forearm, lengths.palm, scale) <= 0
  )
    return new Error("Invalid arm grip motion geometry")
  if (
    Math.hypot(...props.from.map((value, axis) => value - props.skeleton.p[`upperarm_${props.hand}`][axis])) === 0 ||
    Math.hypot(...props.to.map((value, axis) => value - props.skeleton.p[`upperarm_${props.hand}`][axis])) === 0
  )
    return new Error("Arm grip target coincides with its shoulder")
  const elbow = twoBoneJointSpeedBound({
    root: props.skeleton.p[`upperarm_${props.hand}`],
    from: props.from,
    to: props.to,
    upper: lengths.upper,
    lower: lengths.forearm + lengths.palm,
    pole: props.pole,
  })
  if (elbow === undefined) return new Error("Arm grip interval has no certified joint speed")

  return getNativeArmMotionBound({ lengths, scale, elbow, grip: Math.hypot(...props.to.map((value, axis) => value - props.from[axis])) })
}
