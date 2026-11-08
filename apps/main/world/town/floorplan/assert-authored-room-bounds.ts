import type { AuthoredPlan, AuthoredRoom } from "#/world/town/floorplan/authored-types"

/** Reject incomplete or ragged room grids before reading their cells or projecting their contents. */
export function assertAuthoredRoomBounds(room: AuthoredRoom, source: AuthoredPlan): void {
  const width = room.rows[0]?.length ?? 0
  const depth = room.rows.length
  if (
    !Number.isSafeInteger(room.floor) ||
    room.floor < 0 ||
    room.floor >= source.floors ||
    ![room.origin[0], room.origin[1]].every((value) => Number.isSafeInteger(value) && value >= 0) ||
    !width ||
    !depth ||
    room.rows.some((row) => row.length !== width) ||
    room.origin[0] + width > source.width ||
    room.origin[1] + depth > source.depth
  )
    throw new Error(`Invalid authored room: ${room.id}`)
}
