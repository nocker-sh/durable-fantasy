import { certifyLinearInterval } from "#/lib/engine/certify-linear-interval"
import { getWaterLiftIntervalError } from "#/scripts/lib/get-water-lift-interval-error"
import { FRAMES } from "#/world/scene/figure/animation"
import { skelFor } from "#/world/scene/figure/helpers/animation/skel-for"
import type { getWaterPickupProposal } from "#/scripts/lib/get-water-pickup-proposal"
import type { SettingDocument } from "#/scripts/lib/setting-document"
import type { Point3 } from "../../lib/engine/cuboid-motion-types"
type Props = { proposal: NonNullable<Exclude<ReturnType<typeof getWaterPickupProposal>, Error>>; room: SettingDocument }

/** Each native frame stays fixed during the lift; this does not certify interpolation between clip frames or stepping. */
export function getWaterLiftReviewError(props: Props): Error | null {
  const lift = props.proposal.review.lift
  if (!lift) return null
  const proposal = props.proposal,
    to: Point3 = [proposal.position[0], proposal.position[1] + lift.rise_m, proposal.position[2]]
  for (const animation of proposal.review.animations)
    for (const frame of Array.from({ length: FRAMES[animation] }).keys()) {
      const skeleton = skelFor(proposal.look, animation, frame)
      const certified = certifyLinearInterval({ from: proposal.position, to, canClear: (from, to) => getWaterLiftIntervalError({ ...props, skeleton, from, to }) === null })
      if (certified instanceof Error) return new Error(`water lift ${animation}/${frame}: ${certified.message}`, { cause: certified })
    }

  return null
}
