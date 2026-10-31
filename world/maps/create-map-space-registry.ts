import { WORLD } from "#/world/maps/grid"
import { WORLD_SPACE_ROOT } from "#/world/maps/world-space-rules"
import { getWorldMapSquares } from "#/world/maps/get-world-map-squares"
import { getOutdoorMapSpace } from "#/world/maps/get-outdoor-map-space"
import type { Square } from "#/world/maps/grid-types"
import type { MapSpaceRegistry } from "#/world/maps/map-space-types"
import type { MapDefinition } from "#/world/maps/types"

/** Compose spatial references without adding fake playable maps or locating unknown interiors. */
export function createMapSpaceRegistry(maps: Readonly<Record<string, MapDefinition>>, squares: readonly Square[] = WORLD): MapSpaceRegistry {
  if (Object.hasOwn(maps, WORLD_SPACE_ROOT)) throw new Error("World-space root conflicts with a playable map")
  const positions = getWorldMapSquares(squares),
    outdoors = Object.values(maps).filter((map) => map.kind !== "indoor")
  if (new Set(outdoors.map((map) => map.size)).size > 1) throw new Error("Outdoor world-space squares have different sizes")
  const entries: readonly (readonly [string, MapSpaceRegistry[string]])[] = Object.entries(maps).map((entry) => {
    const map = entry[1]
    if (entry[0] !== map.id) throw new Error(`World-space map is miskeyed: ${entry[0]}`)
    if (map.kind === "indoor") return [map.id, { id: map.id, ...(map.space ? { space: map.space } : {}) }]
    const square = positions.get(map.id)
    if (!square) throw new Error(`Outdoor world-space square is missing: ${map.id}`)
    if (map.space) throw new Error(`Outdoor world-space placement conflicts with map metadata: ${map.id}`)
    return [map.id, { id: map.id, space: getOutdoorMapSpace(map, square) }]
  })
  return Object.fromEntries([[WORLD_SPACE_ROOT, { id: WORLD_SPACE_ROOT }], ...entries])
}
