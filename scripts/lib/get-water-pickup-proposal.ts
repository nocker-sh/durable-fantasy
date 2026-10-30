import { potableWaterSupplySchema } from "#/scripts/lib/potable-water-supply-schema"
import { getWaterVesselSupport } from "#/scripts/lib/get-water-vessel-support"
import { getWaterPickupOperationError } from "#/scripts/lib/get-water-pickup-operation-error"
import { toHeadingLocalPoint } from "#/world/scene/to-heading-local-point"
import { seatHeading } from "#/world/town/seat-heading"
import { RESIDENTS, RESIDENT_LOOKS } from "#/world/town/residents"
import type { SettingDocument } from "#/scripts/lib/setting-document"
type Props = { room: SettingDocument; documents: ReadonlyMap<string, SettingDocument> }

/** Resolve one supported jar and its assigned operating place before posing or drawing it. */
export function getWaterPickupProposal(props: Props) {
  const parsed = potableWaterSupplySchema.safeParse(props.room.potable_water_supply)
  if (!parsed.success) return new Error("Invalid water pickup proposal")
  const review = parsed.data.pickup_review,
    grip = parsed.data.grip_review
  if (!review) return null
  const furniture = props.room.furniture?.find((part) => part.symbol === parsed.data.container_symbol),
    carrier = props.documents.get(parsed.data.carrier),
    look = RESIDENT_LOOKS[RESIDENTS.findIndex((resident) => resident.name === carrier?.title)]
  if (!furniture || !look || !grip) return new Error("Water pickup has no placed vessel, carrier or arm proposal")
  const operation = getWaterPickupOperationError({ room: props.room, furniture, review }),
    support = getWaterVesselSupport(props.room, furniture)
  if (operation) return operation
  if (support instanceof Error) return support
  if (props.documents.get(support.support.maker)?.kind !== "residents" || !Array.isArray(props.room.design_dependencies) || !props.room.design_dependencies.includes(support.support.maker))
    return new Error("Water shelf has no registered maker prerequisite")
  const heading = seatHeading(support.support.vessel_facing),
    position = toHeadingLocalPoint(support.position, [review.body_m[0], 0, review.body_m[1]], heading)

  return { review, grip, furniture, look, support, heading, position }
}
