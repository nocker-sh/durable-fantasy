import { getNativeBackstepCyclePose } from "#/world/scene/figure/get-native-backstep-cycle-pose"
import { getHeldWaterVesselPose } from "#/world/scene/figure/get-held-water-vessel-pose"
import { skelFor } from "#/world/scene/figure/helpers/animation/skel-for"
import type { getWaterBackstepProposal } from "#/scripts/lib/get-water-backstep-proposal"
type Props = { withdrawal: NonNullable<Exclude<ReturnType<typeof getWaterBackstepProposal>, Error>>; cycle: number; phase: number }

/** The same lifted jar stays in front of the carrier while the planted shoe remains fixed in room coordinates. */
export function getWaterBackstepFrame(props: Props) {
  const withdrawal = props.withdrawal,
    proposal = withdrawal.proposal,
    step = withdrawal.step
  if (!Number.isSafeInteger(props.cycle) || props.cycle < 0 || props.cycle >= step.cycles) return new Error("Water backward step has no assigned cycle")
  const stepping = getNativeBackstepCyclePose({
    look: proposal.look,
    skeleton: skelFor(proposal.look, step.base_animation, step.base_frame),
    phase: props.phase,
    stride: withdrawal.stride,
    lift: step.foot_lift_m,
    pelvisDrop: step.pelvis_drop_m,
    settlingDrop: step.settling_drop_m,
    leading: step.leading_foot,
    cycle: props.cycle,
  })
  if (stepping instanceof Error) return stepping
  const posed = getHeldWaterVesselPose({
    look: proposal.look,
    skeleton: stepping.skeleton,
    parts: proposal.support.definition.parts,
    position: withdrawal.position,
    scale: 1,
    poles: proposal.grip.poles,
  })
  if (posed instanceof Error) return posed
  const progress = (props.cycle + props.phase) / step.cycles,
    body: readonly [number, number] = [
      proposal.review.body_m[0] + (step.destination_body_m[0] - proposal.review.body_m[0]) * progress,
      proposal.review.body_m[1] + (step.destination_body_m[1] - proposal.review.body_m[1]) * progress,
    ]

  return { posed, body, stepping }
}
