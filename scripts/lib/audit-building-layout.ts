import { auditRoomConnection } from "#/scripts/lib/audit-room-connection"
import { roomConnectionsSchema } from "#/scripts/lib/room-connection-schema"
import { FloorOccupancy } from "#/scripts/lib/floor-occupancy"
import { roomOriginSchema, roomGridSchema } from "#/scripts/lib/room-layout-schema"
import { buildingLayoutSchema, buildingRoomIdsSchema } from "#/scripts/lib/building-layout-schema"
import { getGridBoundaryOpening } from "#/scripts/lib/get-grid-boundary-opening"
import { MIN_PASSAGE_WIDTH_M } from "#/scripts/lib/spatial-rules"
import { auditBuildingDoorInventory } from "#/scripts/lib/audit-building-door-inventory"
import type { SettingDocument } from "#/scripts/lib/setting-document"
import { auditBuildingAccess } from "#/scripts/lib/building-layout/audit-building-access"

/** Check the assembled building, without substituting its projection for the room's own design. */
export function auditBuildingLayout(building: SettingDocument, documents: ReadonlyMap<string, SettingDocument>): string[] {
  const doorErrors = auditBuildingDoorInventory(building, documents)
  if (building.layout === undefined || building.layout === null) return [...doorErrors]

  const parsedLayout = buildingLayoutSchema.safeParse(building.layout)
  if (!parsedLayout.success) return [...doorErrors, "Invalid building dimensions"]

  const roomIds = buildingRoomIdsSchema.safeParse(building.rooms)
  if (!roomIds.success) return [...doorErrors, "Invalid building room inventory"]

  const errors: string[] = [...doorErrors],
    layout = parsedLayout.data
  const placed = new Set<string>(),
    levels = new Set<number>()
  for (const floor of layout.floors) {
    if (!Number.isSafeInteger(floor.floor) || levels.has(floor.floor)) {
      errors.push("Duplicate or invalid floor")
      continue
    }
    levels.add(floor.floor)
    const cells = new FloorOccupancy(layout)
    for (const id of floor.rooms) {
      const room = documents.get(id)
      if (placed.has(id)) errors.push(`${id}: room occurs more than once`)
      placed.add(id)
      if (room?.kind !== "rooms" || !room.grid || room.building !== building.id || room.floor !== floor.floor) {
        errors.push(`${id}: missing grid or wrong building/floor`)
        continue
      }
      const parsedOrigin = roomOriginSchema.safeParse(room.origin)
      if (!parsedOrigin.success) {
        errors.push(`${id}: invalid room origin`)
        continue
      }
      const parsedGrid = roomGridSchema.safeParse(room.grid)
      if (!parsedGrid.success) {
        errors.push(`${id}: invalid room grid`)
        continue
      }
      const origin = parsedOrigin.data,
        grid = parsedGrid.data
      if (grid.cell_m !== layout.cell_m) errors.push(`${id}: inconsistent cell scale`)
      errors.push(...cells.addRoom({ id, origin, rows: grid.rows }))
      const parsedConnections = roomConnectionsSchema.safeParse(room.connections)
      if (!parsedConnections.success) {
        errors.push(`${id}: invalid room connections`)
        continue
      }
      const connections = parsedConnections.data
      for (const connection of connections) errors.push(...auditRoomConnection({ building, room, origin, connection, documents }))
      const declaredDoors = new Set<string>()
      for (const connection of connections)
        if (connection.door) {
          const xState = connection.door,
            x = xState[0],
            y = xState[1],
            width = connection.width_cells ?? 1
          const horizontal: boolean = y === 0 || y === room.grid.rows.length - 1
          if (!horizontal && x !== 0 && x !== (room.grid.rows[0]?.length ?? 0) - 1) errors.push(`${id}: doorway is not on the room boundary`)
          if (!Number.isSafeInteger(width) || width <= 0 || width * layout.cell_m < MIN_PASSAGE_WIDTH_M) {
            errors.push(`${id}: doorway is narrower than design minimum`)
            continue
          }
          if (!getGridBoundaryOpening({ rows: room.grid.rows, door: connection.door, span: width })) {
            errors.push(`${id}: doorway footprint disagrees with grid`)
            continue
          }
          for (const k = { value: 0 }; k.value < width; k.value++) {
            const dx = x + (horizontal ? k.value : 0),
              dy = y + (horizontal ? 0 : k.value)
            if (declaredDoors.has(`${dx},${dy}`)) errors.push(`${id}: doorway cell has multiple connections`)
            declaredDoors.add(`${dx},${dy}`)
            if (room.grid.rows[dy]?.[dx] !== "D") errors.push(`${id}: doorway footprint disagrees with grid`)
          }
        }
      for (const y = { value: 0 }; y.value < room.grid.rows.length; y.value++)
        for (const x = { value: 0 }; x.value < room.grid.rows[y.value].length; x.value++)
          if (room.grid.rows[y.value][x.value] === "D" && !declaredDoors.has(`${x.value},${y.value}`)) errors.push(`${id}: doorway cell has no connection at ${x.value},${y.value}`)
    }
    if (cells.size !== layout.width * layout.depth) errors.push(`Floor ${floor.floor}: unassigned building cells`)
  }
  for (const id of roomIds.data) if (!placed.has(id)) errors.push(`${id}: not placed on a floor`)
  for (const id of placed) if (!roomIds.data.includes(id)) errors.push(`${id}: floor room missing from building inventory`)
  errors.push(...auditBuildingAccess({ building: building, documents: documents, placed: placed, layout: layout }))
  return [...new Set(errors)]
}
