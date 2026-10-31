import { getRoomConnectionScopeError } from "#/scripts/lib/get-room-connection-scope-error"
import { roomOriginSchema } from "#/scripts/lib/room-layout-schema"
import { roomConnectionsSchema } from "#/scripts/lib/room-connection-schema"
import { getReciprocalRoomConnection } from "#/scripts/lib/get-reciprocal-room-connection"
import { auditConnectedRoomDoor } from "#/scripts/lib/audit-connected-room-door"
import { auditConnectedRoomStair } from "#/scripts/lib/audit-connected-room-stair"
import type { SettingDocument } from "#/scripts/lib/setting-document"
import type { Connection } from "#/scripts/lib/building-layout"

type Props = Readonly<{ building: SettingDocument; room: SettingDocument; origin: readonly [number, number]; connection: Connection; documents: ReadonlyMap<string, SettingDocument> }>

/** Resolve a connection's frame and reciprocal declaration before comparing its geometry. */
export function auditRoomConnection(props: Props): string[] {
  const target = props.documents.get(props.connection.target)
  const scopeError = getRoomConnectionScopeError({ building: props.building, roomId: props.room.id, targetId: props.connection.target, kind: props.connection.kind ?? "door", target })
  if (scopeError) return [scopeError]
  if (target?.kind !== "rooms") return []
  const targetOrigin = roomOriginSchema.safeParse(target.origin)
  if (!target.grid || !targetOrigin.success) return [`${props.room.id}: connected room has no grid/origin`]
  const targetConnections = roomConnectionsSchema.safeParse(target.connections)
  if (!targetConnections.success) return [`${target.id}: invalid room connections`]
  const reciprocal = getReciprocalRoomConnection({ roomId: props.room.id, connection: props.connection, candidates: targetConnections.data }),
    errors: string[] = []
  if (reciprocal && (reciprocal.kind ?? "door") !== (props.connection.kind ?? "door")) errors.push(`${props.room.id}: connection kinds disagree`)
  if (!reciprocal) errors.push(`${props.room.id}: connection to ${target.id} is not reciprocal`)
  const geometry = { room: props.room, target, origin: props.origin, targetOrigin: targetOrigin.data, connection: props.connection }
  if (props.connection.kind === "stair") return [...errors, ...auditConnectedRoomStair(geometry)]
  return [...errors, ...auditConnectedRoomDoor({ ...geometry, reciprocal })]
}
