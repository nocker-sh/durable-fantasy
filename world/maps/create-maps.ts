import { OUTDOOR_MAP_DEFINITIONS } from "#/world/maps/outdoor-map-definitions"
import { connectOutdoorMaps } from "#/world/maps/connect-outdoor-maps"
import { assertMapSpaceRegistry } from "#/world/maps/assert-map-space-registry"
import { assertMapConnections } from "#/world/maps/assert-map-connections"
import { indoorMaps } from "#/world/maps/indoor-maps"
import { getIndoorMapName } from "#/world/maps/get-indoor-map-name"
import { withIndoorMapDoors } from "#/world/maps/with-indoor-map-doors"
import { getMapResidents } from "#/world/maps/get-map-residents"
import { MAP_SPRITES } from "#/world/maps/map-asset-rules"
import { INTERIORS } from "#/world/town/interiors"
import type { MapDefinition } from "#/world/maps/types"

/** One assembly path for map data, topology, physical registration, then resident placement. */
export function createMaps(): Record<string, MapDefinition> {
  const indoors = indoorMaps(INTERIORS, { sprites: MAP_SPRITES, name: getIndoorMapName, npcs: () => [] })
  const outdoors = connectOutdoorMaps(Object.fromEntries(OUTDOOR_MAP_DEFINITIONS.map((map) => [map.id, map])))
  const maps = { ...Object.fromEntries(Object.values(outdoors).map((map) => [map.id, map.kind === "town" ? withIndoorMapDoors(map, INTERIORS) : map])), ...indoors }
  assertMapSpaceRegistry(maps)
  assertMapConnections(maps)
  for (const map of Object.values(maps)) map.npcs = getMapResidents(map)
  return maps
}
