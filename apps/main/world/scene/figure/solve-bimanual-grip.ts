import { solveArmGrip } from "#/world/scene/figure/solve-arm-grip"
import type { Skel } from "#/world/scene/rig"
import type { Point3 } from "#/lib/engine/cuboid-motion-types"
type Props = { skeleton: Skel; grips: Record<"l" | "r", Point3>; poles: Record<"l" | "r", Point3> }
/** Both shoulders and bone lengths stay fixed; wrist rotation and contact surfaces require separate checks. */
export function solveBimanualGrip(props: Props) {
  const left = solveArmGrip({ skeleton: props.skeleton, side: "l", target: [...props.grips.l], pole: [...props.poles.l] })
  if (!left) return new Error("Left box grip is unreachable without stretching the arm")
  const right = solveArmGrip({ skeleton: props.skeleton, side: "r", target: [...props.grips.r], pole: [...props.poles.r] })
  if (!right) return new Error("Right box grip is unreachable without stretching the arm")

  const skeleton: Skel = { ...props.skeleton, p: { ...props.skeleton.p, lowerarm_l: left.elbow, hand_l: left.wrist, lowerarm_r: right.elbow, hand_r: right.wrist } }
  return { skeleton, left, right }
}
