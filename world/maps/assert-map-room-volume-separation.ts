import { overlap } from "#/world/town/floorplan/overlap"
import { getMapRoomVolumes } from "#/world/maps/get-map-room-volumes"
import type { MapSpaceRegistry } from "#/world/maps/map-space-types"
import type { MapRoomVolume } from "#/world/maps/room-space-types"

/** Intersections require positive volume; common walls and floor-to-ceiling contact remain valid. */
export function assertMapRoomVolumeSeparation(maps: MapSpaceRegistry): void {
  const roots = new Map<string, MapRoomVolume[]>()
  for (const map of Object.values(maps))
    for (const current of getMapRoomVolumes(maps, map.id)) {
      const occupied = roots.get(current.rootSpace) ?? []
      roots.set(current.rootSpace, occupied)
      for (const previous of occupied)
        if (
          previous.mapId !== current.mapId &&
          previous.elevationMetres < current.ceilingElevationMetres &&
          current.elevationMetres < previous.ceilingElevationMetres &&
          overlap(previous.bounds, current.bounds)
        )
          throw new Error(`Map room volumes overlap: ${previous.mapId} / ${previous.roomId} and ${current.mapId} / ${current.roomId}`)
      occupied.push(current)
    }
}
