import { overlap } from "#/world/town/floorplan/overlap"
import { getMapRoomFootprints } from "#/world/maps/get-map-room-footprints"
import type { MapSpaceRegistry } from "#/world/maps/map-space-types"
import type { MapRoomFootprint } from "#/world/maps/room-space-types"

/** Only compare known room strips in the same direct parent at exactly the same physical floor elevation. */
export function assertMapRoomSeparation(maps: MapSpaceRegistry): void {
  const parents = new Map<string, Map<number, MapRoomFootprint[]>>()
  for (const map of Object.values(maps))
    for (const current of getMapRoomFootprints(map)) {
      const elevations = parents.get(current.parentMap) ?? new Map<number, MapRoomFootprint[]>()
      parents.set(current.parentMap, elevations)
      const plane = elevations.get(current.elevationMetres) ?? []
      elevations.set(current.elevationMetres, plane)
      for (const previous of plane)
        if (previous.mapId !== current.mapId && overlap(previous.bounds, current.bounds))
          throw new Error(`Map room planes overlap: ${previous.mapId} / ${previous.roomId} and ${current.mapId} / ${current.roomId}`)
      plane.push(current)
    }
}
