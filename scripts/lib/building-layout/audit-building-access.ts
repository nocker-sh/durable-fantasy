import type { SettingDocument } from "#/scripts/lib/setting-document"
import type { Connection, Layout } from "#/scripts/lib/building-layout"

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
    for (const connection of (room.connections ?? []) as Connection[]) {
      const target = props.documents.get(connection.target)
      if (target?.kind === "maps") {
        const origin = room.origin as number[] | undefined,
          door = connection.door
        if (!origin || !door || !room.grid) continue
        const x = origin[0] + door[0],
          y = origin[1] + door[1]
        const onOutline = x === 0 || x === props.layout.width - 1 || y === 0 || y === props.layout.depth - 1
        if (room.floor !== 0 || !onOutline || !["town", "field"].includes(String(target.map_kind)) || target.id !== props.building.map)
          errors.push(`${id}: exterior door does not reach the building's outside map`)
        else outside.add(id)
      } else if (target?.kind === "rooms" && props.placed.has(target.id) && ((target.connections ?? []) as Connection[]).some((reverse) => reverse.target === id)) edges.push(target.id)
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
