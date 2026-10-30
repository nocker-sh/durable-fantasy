import { getWaterVesselLandingError } from "#/scripts/lib/get-water-vessel-landing-error"
import { getHeldWaterVesselPose } from "#/world/scene/figure/get-held-water-vessel-pose"
import { getWaterVesselDefinition } from "#/scripts/lib/get-water-vessel-definition"
import { potableWaterSupplySchema } from "#/scripts/lib/potable-water-supply-schema"
import { FRAMES } from "#/world/scene/figure/animation"
import { skelFor } from "#/world/scene/figure/helpers/animation/skel-for"
import { FIG } from "#/world/scene/figure/display-scale"
import { RESIDENTS, RESIDENT_LOOKS } from "#/world/town/residents"
import type { SettingDocument } from "#/scripts/lib/setting-document"
type Props = { room: SettingDocument; documents: ReadonlyMap<string, SettingDocument>; metresPerTile: number }

/** The physical jar and native carrier use the same source dimensions at every authored static frame. */
export function getWaterVesselGripReviewError(props: Props): Error | null {
  const supply = potableWaterSupplySchema.safeParse(props.room.potable_water_supply)
  if (!supply.success) return new Error("Invalid water vessel grip proposal")
  if (!supply.data.grip_review) return null
  const vessel = props.room.furniture?.find((part) => part.symbol === supply.data.container_symbol),
    actor = props.documents.get(supply.data.carrier)
  const look = RESIDENT_LOOKS[RESIDENTS.findIndex((resident) => resident.name === actor?.title)]
  if (!vessel || !look || actor?.kind !== "residents") return new Error("Water grip review has no placed vessel or native carrier")
  const definition = getWaterVesselDefinition(vessel),
    review = supply.data.grip_review,
    facility = props.documents.get(supply.data.source)
  if (facility?.kind !== "facilities") return new Error("Water grip review has no collection facility")
  if (definition instanceof Error) return definition
  for (const animation of ["idle", "look", "carry"] satisfies ("idle" | "look" | "carry")[])
    for (const frame of Array.from({ length: FRAMES[animation] }).keys()) {
      const posed = getHeldWaterVesselPose({
        look,
        skeleton: skelFor(look, animation, frame),
        parts: definition.parts,
        position: review.position_body_m,
        scale: FIG * props.metresPerTile,
        poles: review.poles,
      })
      if (posed instanceof Error) return new Error(`${animation}/${frame}: ${posed.message}`, { cause: posed })
      const floor = getWaterVesselLandingError({ facility, carrier: actor.id, look, posed, metresPerTile: props.metresPerTile })
      if (floor) return floor
    }

  return null
}
