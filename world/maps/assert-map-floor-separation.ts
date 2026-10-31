import { overlap } from "#/world/town/floorplan/overlap"
import { getMapFloorVolumes } from "#/world/maps/get-map-floor-volumes"
import { getMapRoomVolumes } from "#/world/maps/get-map-room-volumes"
import type { MapSpaceRegistry } from "#/world/maps/map-space-types"
import type { MapFloorVolume } from "#/world/maps/floor-space-types"

/** A floor's two faces may touch a ceiling or another floor, but its material may not consume their space. */
export function assertMapFloorSeparation(maps: MapSpaceRegistry): void {
  const floors = Object.values(maps).flatMap((map) => getMapFloorVolumes(maps, map.id)),
    rooms = Object.values(maps).flatMap((map) => getMapRoomVolumes(maps, map.id))
  const occupied: MapFloorVolume[] = []
  for (const floor of floors) {
    for (const room of rooms)
      if (floor.rootSpace === room.rootSpace && floor.undersideElevationMetres < room.ceilingElevationMetres && room.elevationMetres < floor.floorElevationMetres && overlap(floor.bounds, room.bounds))
        throw new Error(`Map floor intersects room: ${floor.mapId} and ${room.mapId} / ${room.roomId}`)
    for (const previous of occupied)
      if (
        floor.rootSpace === previous.rootSpace &&
        floor.undersideElevationMetres < previous.floorElevationMetres &&
        previous.undersideElevationMetres < floor.floorElevationMetres &&
        overlap(floor.bounds, previous.bounds)
      )
        throw new Error(`Map floors overlap: ${previous.mapId} and ${floor.mapId}`)
    occupied.push(floor)
  }
}
