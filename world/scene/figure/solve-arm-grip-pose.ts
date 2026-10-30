import { solveArmGrip } from "#/world/scene/figure/solve-arm-grip"
import type { Skel } from "#/world/scene/rig"
import type { Point3 } from "../../../lib/engine/cuboid-motion-types"
type Props = { skeleton: Skel; hand: "l" | "r"; target: Point3; pole: Point3 }

/** Change only the solved elbow and wrist; the native shoulders, other arm, root and rest lengths stay intact. */
export function solveArmGripPose(props: Props) {
  if (![...props.target, ...props.pole].every(Number.isFinite)) return new Error("Invalid arm grip target")
  const solution = solveArmGrip({ skeleton: props.skeleton, side: props.hand, target: [...props.target], pole: [...props.pole] })
  if (!solution) return new Error("Arm grip target is unreachable without stretching")
  const skeleton: Skel = { ...props.skeleton, p: { ...props.skeleton.p, [`lowerarm_${props.hand}`]: solution.elbow, [`hand_${props.hand}`]: solution.wrist } }

  return { skeleton, solution }
}
