import { z } from "zod"
import { getFloorRoomPlacement } from "#/scripts/lib/get-floor-room-placement"
import { auditAuthoredRoom } from "#/scripts/lib/audit-authored-room"
import { getAuthoredRoomUse } from "#/scripts/lib/get-authored-room-use"
import { roomConnectionsSchema } from "#/scripts/lib/room-connection-schema"
import type { SettingDocument } from "#/scripts/lib/setting-document"

type Props = Readonly<{ building: SettingDocument; documents: ReadonlyMap<string, SettingDocument>; id: string; floor: number; cellM: number }>
const roomNameSchema = z.string().min(1)

/** Keep the original document for contextual audits, with separately decoded placement and connections for export. */
export function getAuthoredRoomSource(props: Props) {
  const placement = getFloorRoomPlacement({ buildingId: props.building.id, floor: props.floor, id: props.id, room: props.documents.get(props.id) })
  if (placement instanceof Error || placement.grid.cell_m !== props.cellM) throw new Error(`Missing or inconsistent authored room: ${props.id}`)
  const document = placement.room,
    errors = auditAuthoredRoom(document, props.building, props.documents)
  if (errors.length) throw new Error(`${props.id}: ${errors.join("; ")}`)
  const name = roomNameSchema.safeParse(document.room_name),
    connections = roomConnectionsSchema.safeParse(document.connections)
  if (!name.success) throw new Error(`Missing authored room name: ${props.id}`)
  if (!connections.success) throw new Error(`Invalid authored connections: ${props.id}`)
  const use = getAuthoredRoomUse(document.use)
  if (use instanceof Error) throw new Error(`Unsupported authored use: ${props.id}/${document.use}`)
  return { document, name: name.data, connections: connections.data, origin: placement.origin, grid: placement.grid, use }
}
