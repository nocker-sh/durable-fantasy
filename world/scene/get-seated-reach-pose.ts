import { getSeatedNativePose } from "#/world/scene/get-seated-native-pose"
import { toHeadingLocalPoint } from "#/world/scene/to-heading-local-point"
import { solveArmGripPose } from "#/world/scene/figure/solve-arm-grip-pose"
import type { Point3 } from "../../lib/engine/cuboid-motion-types"
type Props = Parameters<typeof getSeatedNativePose>[0] & { target: Point3; hand: "l" | "r"; pole: Point3 }

/** Solve one arm at fixed native lengths, preserving the seated root, legs and other arm. */
export function getSeatedReachPose(props: Props) {
  if (![...props.target, ...props.pole].every(Number.isFinite)) return new Error("Invalid seated reach target")
  const pose = getSeatedNativePose(props)
  if (pose instanceof Error) return pose
  const target = toHeadingLocalPoint(props.target, pose.root, props.place.heading)
  const posed = solveArmGripPose({ skeleton: pose.skeleton, hand: props.hand, target, pole: props.pole })
  if (posed instanceof Error) return new Error("Seated target is unreachable without stretching the arm", { cause: posed })

  return { ...posed, root: pose.root }
}
