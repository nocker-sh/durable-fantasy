import { auditRoomConnection } from "#/scripts/lib/audit-room-connection"
import { roomOriginSchema, roomGridSchema } from "#/scripts/lib/room-layout-schema"
import { roomConnectionsSchema } from "#/scripts/lib/room-connection-schema"
import { getReciprocalRoomConnection } from "#/scripts/lib/get-reciprocal-room-connection"
import type { SettingDocument } from "#/scripts/lib/setting-document"
import type { Connection } from "#/scripts/lib/building-layout"

type Props = Readonly<{ building: SettingDocument; room: SettingDocument; connection: Connection; documents: ReadonlyMap<string, SettingDocument>; cellMetres: number }>

/** A declared return path alone does not establish a usable link between rooms. */
export function isRoomPassageConnected(props: Props): boolean {
  const origin = roomOriginSchema.safeParse(props.room.origin),
    target = props.documents.get(props.connection.target)
  if (props.room.kind !== "rooms" || props.room.building !== props.building.id || !origin.success || target?.kind !== "rooms") return false
  const grids = [props.room, target].map((room) => roomGridSchema.safeParse(room.grid))
  if (grids.some((grid) => !grid.success || grid.data.cell_m !== props.cellMetres)) return false
  if (auditRoomConnection({ ...props, origin: origin.data }).length) return false
  const targetConnections = roomConnectionsSchema.safeParse(target.connections)
  if (!targetConnections.success) return false
  const reciprocal = getReciprocalRoomConnection({ roomId: props.room.id, connection: props.connection, candidates: targetConnections.data })
  const targetOrigin = roomOriginSchema.safeParse(target.origin)
  if (!reciprocal || !targetOrigin.success || auditRoomConnection({ building: props.building, room: target, origin: targetOrigin.data, connection: reciprocal, documents: props.documents }).length)
    return false
  return true
}
