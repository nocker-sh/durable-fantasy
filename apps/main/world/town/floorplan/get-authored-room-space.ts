import { assertAuthoredPlanDimensions } from "#/world/town/floorplan/assert-authored-plan-dimensions"
import { assertAuthoredRoomBounds } from "#/world/town/floorplan/assert-authored-room-bounds"
import { getAuthoredGridExtent } from "#/world/town/floorplan/get-authored-grid-extent"
import type { AuthoredPlan, AuthoredRoom } from "#/world/town/floorplan/authored-types"
import type { MapRoomSpace } from "#/world/maps/room-space-types"
import type { Rect } from "#/world/town/floorplan/types"

/** Preserve actual interior cells as horizontal metric strips, including furniture but excluding walls and shared portals. */
export function getAuthoredRoomSpace(room: AuthoredRoom, source: AuthoredPlan): MapRoomSpace {
  assertAuthoredPlanDimensions(source)
  assertAuthoredRoomBounds(room, source)
  const footprint: Rect[] = []
  for (const row of room.rows.entries())
    for (const cursor = { x: 0, start: -1 }; cursor.x <= row[1].length; cursor.x++) {
      const tile = row[1][cursor.x]
      if (tile !== undefined && tile !== "#" && tile !== "D") {
        if (cursor.start < 0) cursor.start = cursor.x
      } else if (cursor.start >= 0) {
        footprint.push(getAuthoredGridExtent({ cellM: source.cellM, x: room.origin[0] + cursor.start, z: room.origin[1] + row[0], width: cursor.x - cursor.start, depth: 1 }))
        cursor.start = -1
      }
    }
  return { id: room.id, footprint }
}
