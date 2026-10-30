import { createNativeBodyFrame } from "#/world/scene/figure/create-native-body-frame"
import { getWaterBackstepProposal } from "#/scripts/lib/get-water-backstep-proposal"
import { getWaterBackstepFrame } from "#/scripts/lib/get-water-backstep-frame"
import { getWaterSupportBodyError } from "#/world/scene/figure/get-water-support-body-error"
import { getWaterVesselSupportMotionError } from "#/world/scene/figure/get-water-vessel-support-motion-error"
import { getWaterPickupFloorError } from "#/scripts/lib/get-water-pickup-floor-error"
type Props = Parameters<typeof getWaterBackstepProposal>[0]
const SAMPLES_PER_CYCLE = 100

/** Sample every full cycle and its joins; continuous clearance and balance remain explicitly unverified. */
export function getWaterBackstepReviewError(props: Props): Error | null {
  const withdrawal = getWaterBackstepProposal(props)
  if (withdrawal instanceof Error || !withdrawal) return withdrawal
  const proposal = withdrawal.proposal
  for (const cycle of Array.from({ length: withdrawal.step.cycles }).keys())
    for (const sample of Array.from({ length: SAMPLES_PER_CYCLE + 1 }).keys()) {
      const frame = getWaterBackstepFrame({ withdrawal, cycle, phase: sample / SAMPLES_PER_CYCLE })
      if (frame instanceof Error) return new Error(`water backstep ${cycle}/${sample}: ${frame.message}`, { cause: frame })
      const native = createNativeBodyFrame(proposal.look, frame.posed.skeleton)
      const shared = { native, look: proposal.look, skeleton: frame.posed.skeleton, body: frame.body, rootY: frame.posed.rootY, heading: proposal.heading, parts: proposal.support.parts }
      const error =
        getWaterSupportBodyError(shared) ??
        getWaterVesselSupportMotionError({ ...shared, vessel: proposal.support.definition.parts, from: withdrawal.position, to: withdrawal.position }) ??
        getWaterPickupFloorError({ room: props.room, symbol: proposal.furniture.symbol, look: proposal.look, posed: frame.posed, body: frame.body, heading: proposal.heading, native })
      if (error) return new Error(`water backstep ${cycle}/${sample}: ${error.message}`, { cause: error })
    }

  return null
}
