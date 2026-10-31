import { overlap } from "#/world/town/floorplan/overlap"
import { getMapRoomFootprints } from "#/world/maps/get-map-room-footprints"
import type { MapSpaceRegistry } from "#/world/maps/map-space-types"
import type { MapRoomFootprint } from "#/world/maps/room-space-types"

/** Compare known room strips in the same named root at exactly the same physical floor elevation. */
export function assertMapRoomSeparation(maps: MapSpaceRegistry): void {
  const roots = new Map<string, Map<number, MapRoomFootprint[]>>()
  for (const map of Object.values(maps))
    for (const current of getMapRoomFootprints(maps, map.id)) {
      const elevations = roots.get(current.rootSpace) ?? new Map<number, MapRoomFootprint[]>()
      roots.set(current.rootSpace, elevations)
      const plane = elevations.get(current.elevationMetres) ?? []
      elevations.set(current.elevationMetres, plane)
      for (const previous of plane)
        if (previous.mapId !== current.mapId && overlap(previous.bounds, current.bounds))
          throw new Error(`Map room planes overlap: ${previous.mapId} / ${previous.roomId} and ${current.mapId} / ${current.roomId}`)
      plane.push(current)
    }
}
