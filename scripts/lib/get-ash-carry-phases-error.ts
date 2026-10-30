import { getHeldBoxGaitPose } from "#/world/scene/figure/get-held-box-gait-pose"
import type { CarryGaitPlayback } from "#/world/town/get-carry-gait-frame"
import { FRAMES } from "#/world/scene/figure/animation"
import { getAshTransportError } from "#/scripts/lib/get-ash-transport-error"
type Props = Omit<Parameters<typeof getAshTransportError>[0], "carrier"> & { look: Parameters<typeof getHeldBoxGaitPose>[0]["look"] }
/** Check each existing carry posture in the assigned playback directions without assuming contact or timing. */
export function getAshCarryPhasesError(props: Props): Error | null {
  const animation = props.receiving.transport_candidate.gait_review.animation
  const playbacks = new Set<CarryGaitPlayback>(["forward"])
  for (const step of props.receiving.transport_candidate.gait_review.step_plan) if (step.playback) playbacks.add(step.playback)
  for (const playback of playbacks)
    for (const frame of Array.from({ length: FRAMES[animation] }).keys()) {
      const pose = getHeldBoxGaitPose({ ...props, phase: frame, playback, candidate: props.receiving.grip_candidate })
      if (pose instanceof Error) return new Error(`Carry ${playback} phase ${frame}: ${pose.message}`, { cause: pose })
      const carrier = { look: props.look, skeleton: pose.skeleton, rootY: pose.rootY, turn: pose.turn }
      const error = getAshTransportError({ ...props, carrier })
      if (error) return new Error(`Carry ${playback} phase ${frame}: ${error.message}`, { cause: error })
    }
  return null
}
