import { z } from "zod"
import { getRoomDoorPortals } from "#/scripts/lib/get-room-door-portals"
import type { SettingDocument } from "#/scripts/lib/setting-document"
type Props = Readonly<{ building: SettingDocument; documents: ReadonlyMap<string, SettingDocument> }>

/** Resolve every room in the inventory without borrowing a neighbour's doorway or silently dropping an unresolved room. */
export function getBuildingDoorPortals(props: Props) {
  const rooms = z.array(z.string().min(1)).safeParse(props.building.rooms),
    records: Exclude<ReturnType<typeof getRoomDoorPortals>, Error> = []
  if (props.building.kind !== "buildings" || !rooms.success) return new Error("Door inventory has no building room list")
  for (const id of rooms.data) {
    const room = props.documents.get(id)
    if (!room || room.building !== props.building.id) return new Error("Door inventory room does not belong to its building")
    const portals = getRoomDoorPortals(room)
    if (portals instanceof Error) return portals
    records.push(...portals)
  }

  return records
}
