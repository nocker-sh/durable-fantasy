import { getAuthoredGridExtent } from "#/world/town/floorplan/get-authored-grid-extent"
import type { AuthoredRoom } from "#/world/town/floorplan/authored-types"
import type { PRoom } from "#/world/town/floorplan/types"

/** Project the declared room boundary without fitting or shrinking its authored grid. */
export function getAuthoredRoomExtent(room: AuthoredRoom, cellM: number): PRoom {
  return { name: room.name, use: room.use, floor: room.floor, ...getAuthoredGridExtent({ cellM, x: room.origin[0], z: room.origin[1], width: room.rows[0].length, depth: room.rows.length }) }
}
