import { buildingLayoutSchema, buildingRoomIdsSchema } from "#/scripts/lib/building-layout-schema"
import { getGridBoundaryOpening } from "#/scripts/lib/get-grid-boundary-opening"
import { getRoomConnectionScopeError } from "#/scripts/lib/get-room-connection-scope-error"
import { MIN_PASSAGE_WIDTH_M } from "#/scripts/lib/spatial-rules"
import { auditBuildingDoorInventory } from "#/scripts/lib/audit-building-door-inventory"
import type { SettingDocument } from "#/scripts/lib/setting-document"
import type { Connection } from "#/scripts/lib/building-layout"
import { same } from "#/scripts/lib/building-layout/same"
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
    const cells = new Map<string, string>()
    for (const id of floor.rooms) {
      const room = documents.get(id)
      if (placed.has(id)) errors.push(`${id}: room occurs more than once`)
      placed.add(id)
      if (!room?.grid || room.building !== building.id || room.floor !== floor.floor) {
        errors.push(`${id}: missing grid or wrong building/floor`)
        continue
      }
      const origin = room.origin as number[] | undefined
      if (!Array.isArray(origin) || origin.length !== 2 || origin.some((n) => !Number.isSafeInteger(n))) {
        errors.push(`${id}: invalid room origin`)
        continue
      }
      if (room.grid.cell_m !== layout.cell_m) errors.push(`${id}: inconsistent cell scale`)
      for (const y = { value: 0 }; y.value < room.grid.rows.length; y.value++)
        for (const x = { value: 0 }; x.value < room.grid.rows[y.value].length; x.value++) {
          const gx = origin[0] + x.value,
            gy = origin[1] + y.value,
            key = `${gx},${gy}`,
            symbol = room.grid.rows[y.value][x.value],
            old = cells.get(key)
          if (gx < 0 || gy < 0 || gx >= layout.width || gy >= layout.depth) errors.push(`${id}: outside building`)
          if (old !== undefined && !(old === symbol && ["#", "D"].includes(symbol))) errors.push(`${id}: conflicting room overlap at ${key}`)
          cells.set(key, symbol)
        }
      for (const connection of (room.connections ?? []) as Connection[]) {
        const target = documents.get(connection.target)
        const scopeError = getRoomConnectionScopeError({ building, roomId: id, targetId: connection.target, kind: connection.kind ?? "door", target })
        if (scopeError) {
          errors.push(scopeError)
          continue
        }
        if (target?.kind !== "rooms") continue
        if (!target.grid || !Array.isArray(target.origin)) {
          errors.push(`${id}: connected room has no grid/origin`)
          continue
        }
        const reciprocal = ((target.connections ?? []) as Connection[]).find(
          (other) =>
            other.target === id &&
            (connection.kind === "stair"
              ? other.kind === "stair" && other.furniture === connection.target_furniture && other.target_furniture === connection.furniture
              : same(other.door, connection.target_door) && same(other.target_door, connection.door)),
        )
        if (reciprocal && (reciprocal.kind ?? "door") !== (connection.kind ?? "door")) errors.push(`${id}: connection kinds disagree`)
        if (!reciprocal) errors.push(`${id}: connection to ${target.id} is not reciprocal`)
        if (connection.kind === "stair") {
          const a = room.furniture?.find((f) => f.symbol === connection.furniture),
            b = target.furniture?.find((f) => f.symbol === connection.target_furniture)
          if (
            !a ||
            !b ||
            Math.abs(Number(target.floor) - Number(room.floor)) !== 1 ||
            !same([origin[0] + a.rect[0], origin[1] + a.rect[1], ...a.rect.slice(2)], [Number(target.origin[0]) + b.rect[0], Number(target.origin[1]) + b.rect[1], ...b.rect.slice(2)])
          )
            errors.push(`${id}: stairs do not align between adjacent floors`)
          if (!a?.access.some((p) => same(p, connection.access)) || !b?.access.some((p) => same(p, connection.target_access))) errors.push(`${id}: stair endpoints are not furniture use positions`)
        } else {
          const a = connection.door,
            b = connection.target_door
          if (!a || !b || room.floor !== target.floor || !same([origin[0] + a[0], origin[1] + a[1]], [Number(target.origin[0]) + b[0], Number(target.origin[1]) + b[1]]))
            errors.push(`${id}: connected doors do not meet`)
          if (connection.width_cells !== reciprocal?.width_cells) errors.push(`${id}: door widths disagree`)
        }
      }
      const declaredDoors = new Set<string>()
      for (const connection of (room.connections ?? []) as Connection[])
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
