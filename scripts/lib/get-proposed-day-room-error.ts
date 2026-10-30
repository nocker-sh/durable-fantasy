import type { SettingDocument } from "#/scripts/lib/setting-document"
import type { ResidentDayActivity } from "#/world/town/resident-day-plan-schema"
type Props = Readonly<{ resident: SettingDocument; room: SettingDocument; activity: ResidentDayActivity; documents: ReadonlyMap<string, SettingDocument> }>

/** Access belongs to the declared resident and building, rather than any room with the same activity label. */
export function getProposedDayRoomError(props: Props): Error | null {
  const room = props.room,
    resident = props.resident,
    building = props.documents.get(String(room.building))
  const isUser = Array.isArray(room.users) && room.users.includes(resident.id)
  const isBuildingUser = [building?.residents, building?.workers].some((people) => Array.isArray(people) && people.includes(resident.id))
  if (
    room.kind !== "rooms" ||
    room.town !== resident.town ||
    building?.kind !== "buildings" ||
    building.town !== resident.town ||
    room.map !== building.map ||
    !Array.isArray(building.rooms) ||
    !building.rooms.includes(room.id)
  )
    return new Error("Proposed day has no matching room and building")
  if (
    (!isBuildingUser && !isUser) ||
    (!(Array.isArray(room.occupants) && room.occupants.includes(resident.title)) && !isUser) ||
    (Array.isArray(room.private_for) && !room.private_for.includes(resident.id))
  )
    return new Error("Proposed day uses another resident's room")
  if (props.activity === "sleep" && room.id !== resident.bedroom) return new Error("Proposed day does not sleep in the personal bedroom")
  if (props.activity === "work" && (!Array.isArray(resident.work_rooms) || !resident.work_rooms.includes(room.id))) return new Error("Proposed day works outside its declared workplace")
  if (props.activity === "water" && !room.furniture?.some((piece) => piece.role === "potable_water_storage")) return new Error("Proposed day stores drinking water without potable storage")

  return null
}
