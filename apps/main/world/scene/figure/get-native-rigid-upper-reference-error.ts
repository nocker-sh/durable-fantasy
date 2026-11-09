import { lowerNativePose } from "#/world/scene/figure/lower-native-pose"
import { getSingleBarGripPose } from "#/world/scene/figure/get-single-bar-grip-pose"
import { getNativeRigidUpperPoseMismatchError } from "#/world/scene/figure/get-native-rigid-upper-pose-mismatch-error"
type Props = Omit<Parameters<typeof getSingleBarGripPose>[0], "skeleton" | "target"> &
  Readonly<{ native: Parameters<typeof lowerNativePose>[0]["skeleton"]; reference: Parameters<typeof lowerNativePose>[0]["skeleton"]; pelvisDrop: number }>

/** Reconstruct the same phase-independent upper pose used by the actual gait assembler, rather than trusting an unrelated reference image. */
export function getNativeRigidUpperReferenceError(props: Props): Error | null {
  const lowered = lowerNativePose({ skeleton: props.native, drop: props.pelvisDrop })
  if (lowered instanceof Error) return lowered
  const bar = props.bar,
    expected = getSingleBarGripPose({ ...props, skeleton: lowered, target: [(bar.from[0] + bar.to[0]) / 2, (bar.from[1] + bar.to[1]) / 2, (bar.from[2] + bar.to[2]) / 2] })
  if (expected instanceof Error) return expected

  return getNativeRigidUpperPoseMismatchError({ expected: expected.skeleton, actual: props.reference })
}
