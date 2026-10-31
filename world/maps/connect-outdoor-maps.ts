import { getLargestWalkableRegion } from "#/world/maps/get-largest-walkable-region"
import { getOutdoorCrossings } from "#/world/maps/get-outdoor-crossings"
import { getOutdoorMapDistances } from "#/world/maps/get-outdoor-map-distances"
import { getOutdoorSpawn } from "#/world/maps/get-outdoor-spawn"
import type { MapDefinition } from "#/world/maps/types"

/** Build topology on owned map records; each input grid is analyzed once per assembly. */
export function connectOutdoorMaps(source: Readonly<Record<string, MapDefinition>>): Record<string, MapDefinition> {
  const maps: Record<string, MapDefinition> = Object.fromEntries(Object.entries(source).map((entry) => [entry[0], { ...entry[1] }]))
  const regions = new Map(Object.values(maps).map((map) => [map.id, getLargestWalkableRegion(map)]))
  for (const map of Object.values(maps)) map.warps = getOutdoorCrossings(map, maps, regions)
  const distances = getOutdoorMapDistances(maps)
  for (const map of Object.values(maps)) {
    const spawn = getOutdoorSpawn(map, maps, distances)
    if (spawn) map.spawn = spawn
  }
  return maps
}
