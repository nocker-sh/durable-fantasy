import { assertMapRoomSpaces } from "#/world/maps/assert-map-room-spaces"
import { getMapSpaceFrame } from "#/world/maps/get-map-space-frame"
import type { MapSpaceRegistry } from "#/world/maps/map-space-types"
import type { MapRoomFootprint } from "#/world/maps/room-space-types"

/** Quarter-turn frames keep each strip rectangular; never replace an entire irregular room with its outer bounds. */
export function getMapRoomFootprints(map: MapSpaceRegistry[string]): readonly MapRoomFootprint[] {
  const space = map.space
  if (!space) return []
  try {
    assertMapRoomSpaces(space)
    const frame = getMapSpaceFrame(space)
    return (space.rooms ?? []).flatMap((room) =>
      room.footprint.map((rect) => {
        const first = frame.toWorld([rect.x0, 0, rect.z0]),
          second = frame.toWorld([rect.x1, 0, rect.z1])
        const bounds = { x0: Math.min(first[0], second[0]), z0: Math.min(first[2], second[2]), x1: Math.max(first[0], second[0]), z1: Math.max(first[2], second[2]) }
        if (bounds.x1 <= bounds.x0 || bounds.z1 <= bounds.z0) throw new Error(`Map room footprint collapses in parent space: ${map.id} / ${room.id}`)
        return { mapId: map.id, roomId: room.id, parentMap: space.parentMap, elevationMetres: first[1], bounds }
      }),
    )
  } catch (error) {
    if (error instanceof RangeError) throw new Error(`Map space frame is invalid: ${map.id}`, { cause: error })
    throw error
  }
}
