import { roomConnectionsSchema } from "#/scripts/lib/room-connection-schema"
import { roomOriginSchema } from "#/scripts/lib/room-layout-schema"
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
        const origin = roomOriginSchema.safeParse(room.origin),
          door = connection.door
        if (!origin.success || !door || !room.grid) continue
        const x = origin.data[0] + door[0],
          y = origin.data[1] + door[1]
        const onOutline = x === 0 || x === props.layout.width - 1 || y === 0 || y === props.layout.depth - 1
        if (room.floor !== 0 || !onOutline || !["town", "field"].includes(String(target.map_kind)) || target.id !== props.building.map)
          errors.push(`${id}: exterior door does not reach the building's outside map`)
        else outside.add(id)
      } else if (target?.kind === "rooms" && props.placed.has(target.id)) {
        const reverseConnections = roomConnectionsSchema.safeParse(target.connections)
        if (reverseConnections.success && reverseConnections.data.some((reverse) => reverse.target === id)) edges.push(target.id)
      }
    }
    neighbors.set(id, edges)
  }
  const reached = new Set<string>(),
    queue = [...outside]
  for (const i = { value: 0 }; i.value < queue.length; i.value++) {
    const id = queue[i.value]
    if (reached.has(id)) continue
    reached.add(id)
    for (const next of neighbors.get(id) ?? []) if (!reached.has(next)) queue.push(next)
  }
  for (const id of props.placed) if (!reached.has(id)) errors.push(`${id}: no route to the building's exterior`)
  return errors
}
