import { roomConnectionsSchema } from "#/scripts/lib/room-connection-schema"
import { isRoomPassageConnected } from "#/scripts/lib/is-room-passage-connected"
import { getExteriorRoomConnectionError } from "#/scripts/lib/get-exterior-room-connection-error"
import type { SettingDocument } from "#/scripts/lib/setting-document"
import type { Layout } from "#/scripts/lib/building-layout"

type Props = {
  building: SettingDocument
  documents: ReadonlyMap<string, SettingDocument>
  placed: ReadonlySet<string>
  layout: Layout
}

export function auditBuildingAccess(props: Props): string[] {
  const errors: string[] = [],
    outside = new Set<string>(),
    neighbors = new Map<string, string[]>()
  for (const id of props.placed) {
    const room = props.documents.get(id)
    if (!room) continue
    const edges: string[] = []
    const parsedConnections = roomConnectionsSchema.safeParse(room.connections)
    if (!parsedConnections.success) {
      errors.push(`${id}: invalid room connections`)
      continue
    }
    for (const connection of parsedConnections.data) {
      const target = props.documents.get(connection.target)
      if (target?.kind === "maps") {
        const error = getExteriorRoomConnectionError({ building: props.building, room, connection, target, layout: props.layout })
        if (error) errors.push(error)
        else outside.add(id)
      } else if (
        target?.kind === "rooms" &&
        props.placed.has(target.id) &&
        isRoomPassageConnected({ building: props.building, room, connection, documents: props.documents, cellMetres: props.layout.cell_m })
      )
        edges.push(target.id)
    }

    neighbors.set(id, edges)
  }
  const reached = new Set<string>(),
    queue = [...outside]
  for (const id of queue) {
    if (reached.has(id)) continue
    reached.add(id)
    for (const next of neighbors.get(id) ?? []) if (!reached.has(next)) queue.push(next)
  }
  for (const id of props.placed) if (!reached.has(id)) errors.push(`${id}: no route to the building's exterior`)
  return errors
}
