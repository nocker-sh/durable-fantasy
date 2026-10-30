import { getNativeSideStepPose } from "#/world/scene/figure/get-native-side-step-pose"
import { solveHeldBoxPose } from "#/world/scene/figure/solve-held-box-pose"
type Props = Omit<Parameters<typeof solveHeldBoxPose>[0], "skeleton"> & Omit<Parameters<typeof getNativeSideStepPose>[0], "look">
/** Retain the same box anchors while the native legs step sideways, without reusing forward walking. */
export function getHeldBoxSideStepPose(props: Props) {
  const stepping = getNativeSideStepPose(props)
  if (stepping instanceof Error) return stepping
  const held = solveHeldBoxPose({ ...props, skeleton: stepping.skeleton })
  if (held instanceof Error) return held
  return { ...held, offsets: stepping.offsets }
}
