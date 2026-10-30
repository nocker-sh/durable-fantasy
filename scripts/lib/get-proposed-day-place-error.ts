import type { z } from "zod"
import type { residentProposalSchema } from "#/scripts/lib/resident-proposal-schema"
import type { townDistrictPlanSchema } from "#/scripts/lib/town-district-plan-schema"
import type { residentDayPlaceSchema, ResidentDayActivity } from "#/world/town/resident-day-plan-schema"
import type { SettingDocument } from "#/scripts/lib/setting-document"
import { getProposedDayRoomError } from "#/scripts/lib/get-proposed-day-room-error"
type Props = Readonly<{
  resident: SettingDocument
  proposal: z.infer<typeof residentProposalSchema>
  study: z.infer<typeof townDistrictPlanSchema>
  place: z.infer<typeof residentDayPlaceSchema>
  activity: ResidentDayActivity
  documents: ReadonlyMap<string, SettingDocument>
}>

/** Districts are local to the resident's town; water and food cannot silently use another trade's allocation. */
export function getProposedDayPlaceError(props: Props): Error | null {
  const place = props.place
  if (place.kind === "room") {
    const room = props.documents.get(place.room)
    if (!room) return new Error("Proposed day references an unresolved room")
    return getProposedDayRoomError({ resident: props.resident, room, activity: props.activity, documents: props.documents })
  }
  const district = props.study.districts.find((candidate) => candidate.symbol === place.symbol)
  if (!district) return new Error("Proposed day references an unresolved district")
  if (props.activity === "sleep") return new Error("Proposed day does not sleep in the personal bedroom")
  if (props.activity === "work" && (district.symbol !== props.proposal.work_district || district.role !== props.proposal.work_district_role))
    return new Error("Proposed day works outside its declared workplace")
  if ((props.activity === "water" && district.role !== "water") || (props.activity === "food_collection" && district.role !== "food"))
    return new Error("Proposed day collects supplies from an unrelated district")

  return null
}
