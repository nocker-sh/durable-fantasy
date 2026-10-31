import { getMapRoomFootprints } from "#/world/maps/get-map-room-footprints"
import type { MapSpaceRegistry } from "#/world/maps/map-space-types"
import type { MapRoomVolume } from "#/world/maps/room-space-types"

/** Only explicitly measured clear heights form volumes; display scales and unknown ceilings are never substituted. */
export function getMapRoomVolumes(maps: MapSpaceRegistry, mapId: string): readonly MapRoomVolume[] {
  const footprints = getMapRoomFootprints(maps, mapId)
  const heights = new Map(maps[mapId].space?.rooms?.map((room) => [room.id, room.heightMetres]))
  return footprints.flatMap((strip) => {
    const height = heights.get(strip.roomId)
    if (height === undefined) return []
    const ceilingElevationMetres = strip.elevationMetres + height
    if (!Number.isFinite(ceilingElevationMetres) || ceilingElevationMetres <= strip.elevationMetres) throw new Error(`Map room volume collapses in parent space: ${mapId} / ${strip.roomId}`)
    return [{ ...strip, ceilingElevationMetres }]
  })
}
