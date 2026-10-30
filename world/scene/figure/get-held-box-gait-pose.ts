import { getCarryGaitFrame, type CarryGaitPlayback } from "#/world/town/get-carry-gait-frame"
import { FRAMES } from "#/world/scene/figure/animation"
import { skelFor } from "#/world/scene/figure/helpers/animation/skel-for"
import { solveHeldBoxPose } from "#/world/scene/figure/solve-held-box-pose"
type Props = Omit<Parameters<typeof solveHeldBoxPose>[0], "skeleton"> & { phase: number; playback: CarryGaitPlayback }
/** Preserve native leg poses in either temporal direction, then solve the unchanged arms against the same held box. */
export function getHeldBoxGaitPose(props: Props) {
  const frame = getCarryGaitFrame({ phase: props.phase, frameCount: FRAMES.carry, playback: props.playback })
  if (frame instanceof Error) return frame
  return solveHeldBoxPose({ ...props, skeleton: skelFor(props.look, "carry", frame) })
}
