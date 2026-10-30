import { potableWaterCollectionSchema } from "#/scripts/lib/potable-water-supply-schema"
import { getWaterStandingPlacement } from "#/scripts/lib/get-water-standing-placement"
import { getStandingFootprintError } from "#/world/scene/get-standing-footprint-error"
import { MAPS } from "#/world/maps/index"
import { layoutOf } from "#/world/maps/layouts"
import type { getHeldWaterVesselPose } from "#/world/scene/figure/get-held-water-vessel-pose"
import type { SettingDocument } from "#/scripts/lib/setting-document"
import type { Look } from "#/world/scene/figure/look"
type Props = { facility: SettingDocument; carrier: string; look: Look; posed: Exclude<ReturnType<typeof getHeldWaterVesselPose>, Error>; metresPerTile: number }

/** The complete held vessel and solved arms must fit the same source landing at all three static placements. */
export function getWaterVesselLandingError(props: Props): Error | null {
  const collection = potableWaterCollectionSchema.safeParse(props.facility.water_collection),
    site = props.facility.site
  if (!collection.success || !collection.data.landing?.body_review || collection.data.landing.body_review.resident !== props.carrier)
    return new Error("Held water vessel has no matching landing body review")
  if (!site || typeof site !== "object" || !("map" in site) || typeof site.map !== "string" || !MAPS[site.map.replace(/^map-/, "")]) return new Error("Held water vessel has no native collection map")
  const landing = collection.data.landing,
    layout = layoutOf(site.map.replace(/^map-/, ""))
  for (const position of collection.data.landing.body_review.placements) {
    const placement = getWaterStandingPlacement({ landing, placement: position, anchorTiles: layout.plaza, metresPerTile: props.metresPerTile })
    if (placement instanceof Error) return placement
    const error = getStandingFootprintError({ ...placement, look: props.look, skeleton: props.posed.skeleton, extraPrimitives: props.posed.primitives })
    if (error) return new Error(`Held vessel ${position.zone}: ${error.message}`, { cause: error })
  }

  return null
}
