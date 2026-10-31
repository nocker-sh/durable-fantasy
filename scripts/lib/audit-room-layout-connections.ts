import { roomConnectionsSchema } from "#/scripts/lib/room-connection-schema"
import { RoomDoorwayInventory } from "#/scripts/lib/room-doorway-inventory"
import { auditRoomConnection } from "#/scripts/lib/audit-room-connection"
import type { SettingDocument } from "#/scripts/lib/setting-document"

type Props = Readonly<{
  building: SettingDocument
  room: SettingDocument
  origin: readonly [number, number]
  rows: readonly string[]
  cellMetres: number
  documents: ReadonlyMap<string, SettingDocument>
}>

/** Connection metadata and drawn doorway cells must agree independently of floor coverage. */
export function auditRoomLayoutConnections(props: Props): readonly string[] {
  const parsed = roomConnectionsSchema.safeParse(props.room.connections)
  if (!parsed.success) return [`${props.room.id}: invalid room connections`]

  const errors = parsed.data.flatMap((connection) => auditRoomConnection({ ...props, connection }))
  const doorways = new RoomDoorwayInventory({ roomId: props.room.id, rows: props.rows, cellMetres: props.cellMetres })
  for (const connection of parsed.data) errors.push(...doorways.addConnection(connection))

  return [...errors, ...doorways.getMissingConnectionErrors()]
}
