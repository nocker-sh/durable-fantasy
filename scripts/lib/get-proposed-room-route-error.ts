import type { z } from "zod"
import type { residentDaySegmentSchema } from "#/world/town/resident-day-plan-schema"
import type { SettingDocument } from "#/scripts/lib/setting-document"
import { getProposedDayRoomError } from "#/scripts/lib/get-proposed-day-room-error"
import { getRoomRouteConnectionError } from "#/scripts/lib/get-room-route-connection-error"
import { auditBuildingLayout } from "#/scripts/lib/audit-building-layout"
type Props = Readonly<{ resident: SettingDocument; segment: Extract<z.infer<typeof residentDaySegmentSchema>, { kind: "travel" }>; documents: ReadonlyMap<string, SettingDocument> }>

/** An indoor itinerary covers accessible rooms in one audited building; outdoor routes and walking time remain unresolved. */
export function getProposedRoomRouteError(props: Props): Error | null {
  const segment = props.segment,
    rooms: SettingDocument[] = []
  if (segment.from.kind === "district" && segment.to.kind === "district" && segment.room_route !== undefined) return new Error("District-only travel cannot declare an indoor endpoint route")
  if (segment.from.kind === "district" && segment.to.kind === "district") return null
  if (!segment.room_route) return new Error("Proposed room travel has no authored indoor route")
  for (const id of segment.room_route) {
    const room = props.documents.get(id)
    if (!room) return new Error("Proposed indoor travel references an unresolved room")
    const error = getProposedDayRoomError({ resident: props.resident, room, activity: "travel", documents: props.documents })
    if (error) return error
    if (rooms.length && rooms[0].building !== room.building) return new Error("Proposed indoor travel crosses buildings without going outdoors")
    rooms.push(room)
  }
  const building = props.documents.get(String(rooms[0]?.building))
  if (!building?.layout) return new Error("Proposed indoor travel has no authored building layout")
  const errors = auditBuildingLayout(building, props.documents)
  if (errors.length) return new Error(`Proposed indoor travel has an invalid building layout: ${errors[0]}`)

  return getRoomRouteConnectionError({ rooms, from: segment.from, to: segment.to })
}
