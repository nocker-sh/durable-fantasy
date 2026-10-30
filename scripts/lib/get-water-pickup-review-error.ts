import { createNativeBodyFrame } from "#/world/scene/figure/create-native-body-frame"
import { getWaterBackstepReviewError } from "#/scripts/lib/get-water-backstep-review-error"
import { getWaterLiftReviewError } from "#/scripts/lib/get-water-lift-review-error"
import { getWaterPickupProposal } from "#/scripts/lib/get-water-pickup-proposal"
import { getWaterPickupFloorError } from "#/scripts/lib/get-water-pickup-floor-error"
import { getHeldWaterVesselPose } from "#/world/scene/figure/get-held-water-vessel-pose"
import { getWaterSupportBodyError } from "#/world/scene/figure/get-water-support-body-error"
import { FRAMES } from "#/world/scene/figure/animation"
import { skelFor } from "#/world/scene/figure/helpers/animation/skel-for"
import type { SettingDocument } from "#/scripts/lib/setting-document"
type Props = { room: SettingDocument; documents: ReadonlyMap<string, SettingDocument> }

/** Stationary pickup starts at the actual supported jar; lift, stepping and other users remain separate operations. */
export function getWaterPickupReviewError(props: Props): Error | null {
  const proposal = getWaterPickupProposal(props)
  if (proposal instanceof Error || !proposal) return proposal

  for (const animation of proposal.review.animations)
    for (const frame of Array.from({ length: FRAMES[animation] }).keys()) {
      const posed = getHeldWaterVesselPose({
        look: proposal.look,
        skeleton: skelFor(proposal.look, animation, frame),
        parts: proposal.support.definition.parts,
        position: proposal.position,
        scale: 1,
        poles: proposal.grip.poles,
      })
      if (posed instanceof Error) return new Error(`${animation}/${frame}: ${posed.message}`, { cause: posed })
      const native = createNativeBodyFrame(proposal.look, posed.skeleton)
      const error =
        getWaterSupportBodyError({
          look: proposal.look,
          skeleton: posed.skeleton,
          body: proposal.review.body_m,
          rootY: posed.rootY,
          heading: proposal.heading,
          parts: proposal.support.parts,
          native,
        }) ?? getWaterPickupFloorError({ room: props.room, symbol: proposal.furniture.symbol, look: proposal.look, posed, body: proposal.review.body_m, heading: proposal.heading, native })
      if (error) return new Error(`${animation}/${frame}: ${error.message}`, { cause: error })
    }

  return getWaterLiftReviewError({ proposal, room: props.room }) ?? getWaterBackstepReviewError({ proposal, room: props.room })
}
