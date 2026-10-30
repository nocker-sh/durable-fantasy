import { getWaterMotionInterval } from "#/world/scene/figure/get-water-motion-interval"
import { getWaterMotionGripError } from "#/world/scene/figure/get-water-motion-grip-error"
import { getWaterMotionBodyError } from "#/world/scene/figure/get-water-motion-body-error"
import { getWaterMotionSupportError } from "#/world/scene/figure/get-water-motion-support-error"
import { getWaterVesselSupportMotionError } from "#/world/scene/figure/get-water-vessel-support-motion-error"
import { getWaterMotionFloorError } from "#/scripts/lib/get-water-motion-floor-error"
import type { getWaterPickupProposal } from "#/scripts/lib/get-water-pickup-proposal"
import type { SettingDocument } from "#/scripts/lib/setting-document"
import type { Skel } from "#/world/scene/rig"
import type { Point3 } from "#/lib/engine/cuboid-motion-types"
type Props = { proposal: NonNullable<Exclude<ReturnType<typeof getWaterPickupProposal>, Error>>; room: SettingDocument; skeleton: Skel; from: Point3; to: Point3 }

/** Each accepted interval proves grip, body, shelf and floor enclosures for the same two-handed motion. */
export function getWaterLiftIntervalError(props: Props): Error | null {
  const proposal = props.proposal
  const interval = getWaterMotionInterval({
    look: proposal.look,
    skeleton: props.skeleton,
    parts: proposal.support.definition.parts,
    from: props.from,
    to: props.to,
    scale: 1,
    poles: proposal.grip.poles,
  })
  if (interval instanceof Error) return interval

  const common = { ...interval, look: proposal.look, body: proposal.review.body_m, heading: proposal.heading, parts: proposal.support.parts }
  return (
    getWaterMotionGripError(interval) ??
    getWaterMotionBodyError(common) ??
    getWaterMotionSupportError(common) ??
    getWaterVesselSupportMotionError({ ...common, vessel: proposal.support.definition.parts, from: props.from, to: props.to, rootY: interval.posed.rootY }) ??
    getWaterMotionFloorError({ ...common, room: props.room, symbol: proposal.furniture.symbol })
  )
}
