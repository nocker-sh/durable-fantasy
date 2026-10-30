import { getHeldBoxSideStepPose } from "#/world/scene/figure/get-held-box-side-step-pose"
import { getAshTransportError } from "#/scripts/lib/get-ash-transport-error"
import type { AshReceiving } from "#/scripts/lib/ash-receiving-schema"
type Props = Omit<Parameters<typeof getAshTransportError>[0], "carrier"> & {
  look: Parameters<typeof getHeldBoxSideStepPose>[0]["look"]
  stride: number
  direction: "left" | "right"
  dimensions: NonNullable<AshReceiving["transport_candidate"]["gait_review"]["side_step"]>
}
/** Sampled side-step poses check native reach and room clearance; gaps between poses and balance remain unverified. */
export function getAshSideStepError(props: Props): Error | null {
  const dimensions = props.dimensions,
    candidate = props.receiving.grip_candidate
  const motion = { stride: props.stride, lift: dimensions.lift_m, pelvisDrop: dimensions.pelvis_drop_m }
  for (const index of Array.from({ length: 33 }).keys()) {
    const pose = getHeldBoxSideStepPose({ ...props, ...motion, phase: index / 32, candidate })
    if (pose instanceof Error) return new Error(`Side-step pose ${index}: ${pose.message}`, { cause: pose })
    const carrier = { look: props.look, skeleton: pose.skeleton, rootY: pose.rootY, turn: pose.turn }
    const error = getAshTransportError({ ...props, carrier })
    if (error) return new Error(`Side-step pose ${index}: ${error.message}`, { cause: error })
  }
  return null
}
