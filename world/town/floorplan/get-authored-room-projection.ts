import { assertAuthoredRoomBounds } from "#/world/town/floorplan/assert-authored-room-bounds"
import { recordAuthoredRoomCells } from "#/world/town/floorplan/record-authored-room-cells"
import { getAuthoredRoomExtent } from "#/world/town/floorplan/get-authored-room-extent"
import { getAuthoredFurniturePlacement } from "#/world/town/floorplan/get-authored-furniture-placement"
import type { AuthoredPlan } from "#/world/town/floorplan/authored-types"
import type { AuthoredCoverage, AuthoredRoomProjection } from "#/world/town/floorplan/authored-projection-types"
import type { PRoom, Placed } from "#/world/town/floorplan/types"

/** Visit rooms and furniture in authored order, preserving validation priority and ownership of working collections. */
export function getAuthoredRoomProjection(source: AuthoredPlan): AuthoredRoomProjection {
  const projected: { rooms: PRoom[]; pieces: Placed[] } = { rooms: [], pieces: [] }
  const coverage: AuthoredCoverage = new Map()
  const roomIds = new Set<string>()
  for (const room of source.rooms) {
    if (roomIds.has(room.id)) throw new Error(`Duplicate authored room: ${room.id}`)
    roomIds.add(room.id)
    assertAuthoredRoomBounds(room, source)
    recordAuthoredRoomCells({ source, room, coverage })
    projected.rooms.push(getAuthoredRoomExtent(room, source.cellM))
    for (const piece of room.furniture) projected.pieces.push(getAuthoredFurniturePlacement({ room, piece, cellM: source.cellM }))
  }
  projected.pieces.push(...source.details)
  const coveredCount = Array.from(coverage.values()).reduce((total, rows) => total + Array.from(rows.values()).reduce((count, row) => count + row.cells.size, 0), 0)
  return { ...projected, floors: coverage, coveredCount }
}
