import { RESIDENTS, RESIDENT_LOOKS } from "#/world/town/residents"
import { getWaterStandingPlacementError } from "#/scripts/lib/get-water-standing-placement-error"
import type { WaterLanding } from "#/scripts/lib/water-landing-schema"
import type { SettingDocument } from "#/scripts/lib/setting-document"
type Props = { document: SettingDocument; documents: ReadonlyMap<string, SettingDocument>; landing: WaterLanding; anchorTiles: readonly [number, number]; metresPerTile: number }

/** A reviewed resident never stands in for all well users; all three authored stages must be present. */
export function getWaterLandingBodyError(props: Props): Error | null {
  const review = props.landing.body_review
  if (!review) return null
  const resident = props.documents.get(review.resident),
    matches = RESIDENTS.flatMap((person, index) => (person.name === resident?.title ? [index] : []))
  if (resident?.kind !== "residents" || !Array.isArray(props.document.users) || !props.document.users.includes(resident.id) || matches.length !== 1 || !RESIDENT_LOOKS[matches[0]])
    return new Error("Water body review has no registered resident or native look")
  const zones = review.placements.map((placement) => placement.zone)
  if (new Set(zones).size !== props.landing.zones.length || props.landing.zones.some((zone) => !zones.includes(zone.symbol)))
    return new Error("Water body review does not cover each landing zone once")
  for (const placement of review.placements) {
    const error = getWaterStandingPlacementError({ ...props, review, placement, look: RESIDENT_LOOKS[matches[0]] })
    if (error) return error
  }

  return null
}
