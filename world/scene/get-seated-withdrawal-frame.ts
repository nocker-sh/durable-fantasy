import { getSeatedNativePose } from "#/world/scene/get-seated-native-pose"
import { armGripPoint } from "#/world/scene/figure/arm-grip-point"
import { solveArmGrip } from "#/world/scene/figure/solve-arm-grip"
import { toHeadingWorldPoint } from "#/world/scene/to-heading-world-point"
import { toHeadingLocalPoint } from "#/world/scene/to-heading-local-point"
import type { Point3 } from "#/lib/engine/cuboid-motion-types"
type Props = Parameters<typeof getSeatedNativePose>[0] & { hand: "l" | "r"; seatTarget: Point3 }

/** Withdrawal and swivel share one target and native pole so their common endpoint cannot drift. */
export function getSeatedWithdrawalFrame(props: Props) {
  const pose = getSeatedNativePose(props)
  if (pose instanceof Error) return pose
  const world = toHeadingWorldPoint(props.seatTarget, [props.place.at[0], 0, props.place.at[1]], props.place.heading)
  const target = toHeadingLocalPoint(world, pose.root, props.place.heading)
  const pole = pose.skeleton.p[`lowerarm_${props.hand}`],
    wrist = pose.skeleton.p[`hand_${props.hand}`]
  const source = armGripPoint(pole, wrist),
    start = solveArmGrip({ skeleton: pose.skeleton, side: props.hand, target: source, pole: pole })
  if (!start || pole.some((value, axis) => Math.abs(value - start.elbow[axis]) > 1e-9) || wrist.some((value, axis) => Math.abs(value - start.wrist[axis]) > 1e-9))
    return new Error("Withdrawal does not join the original native arm pose")

  return { ...pose, source, target, pole }
}
