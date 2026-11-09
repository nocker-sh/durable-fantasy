import type { RoomCell } from "#/world/town/floorplan/room-cell-types"

/** A shared cell must represent the same wall or door on both room boundaries. */
export function canShareRoomCell(first: RoomCell, second: RoomCell): boolean {
  return first.boundary && second.boundary && first.tile === second.tile && (first.tile === "#" || first.tile === "D")
}
