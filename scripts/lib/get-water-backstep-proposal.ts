import { seatForward } from "#/world/town/seat-forward"
import { getWaterPickupOperationError } from "#/scripts/lib/get-water-pickup-operation-error"
import type { getWaterPickupProposal } from "#/scripts/lib/get-water-pickup-proposal"
import type { SettingDocument } from "#/scripts/lib/setting-document"
type Props = { proposal: NonNullable<Exclude<ReturnType<typeof getWaterPickupProposal>, Error>>; room: SettingDocument }

/** The withdrawal keeps the jar raised, stays on the assigned operating floor and follows the carrier's backward axis. */
export function getWaterBackstepProposal(props: Props) {
  const proposal = props.proposal,
    step = proposal.review.backstep
  if (!step) return null
  if (!Number.isSafeInteger(step.cycles) || step.cycles < 1 || step.cycles > 16) return new Error("Invalid water backward step cycles")
  if (!proposal.review.lift) return new Error("Water backward step has no supported lift endpoint")
  const forward = seatForward(proposal.support.support.vessel_facing),
    dx = step.destination_body_m[0] - proposal.review.body_m[0],
    dz = step.destination_body_m[1] - proposal.review.body_m[1]
  const distance = -(dx * forward[0] + dz * forward[1]),
    lateral = dx * forward[1] - dz * forward[0]
  if (!Number.isFinite(distance) || distance <= 0 || Math.abs(lateral) > 1e-9) return new Error("Water withdrawal needs a straight backward path")
  const operation = getWaterPickupOperationError({ room: props.room, furniture: proposal.furniture, review: { ...proposal.review, body_m: step.destination_body_m } })
  if (operation) return operation

  return {
    proposal,
    step,
    stride: distance / step.cycles,
    position: [proposal.position[0], proposal.position[1] + proposal.review.lift.rise_m, proposal.position[2]] satisfies [number, number, number],
  }
}
