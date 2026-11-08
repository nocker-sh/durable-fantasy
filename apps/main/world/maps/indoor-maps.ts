import { getInteriorStairRegistry } from "#/world/town/get-interior-stair-registry"
import { interiorStairLinks } from "#/world/town/interior-stair-links"
import { createIndoorMap } from "#/world/maps/create-indoor-map"
import type { MapDefinition } from "#/world/maps/types"
import type { Cell, Interior } from "#/world/town/interiors"
import type { IndoorMapOptions } from "#/world/maps/indoor-map-types"

/** The same map definitions are consumed by server movement and the client scene. */
export function indoorMaps(interiors: readonly Interior[], options: IndoorMapOptions): Record<string, MapDefinition> {
  const registry = getInteriorStairRegistry(interiors)
  const stairs = interiorStairLinks(registry)
  const arrivals = new Map<string, Cell>()
  for (const links of stairs.values()) for (const link of links) if (!arrivals.has(link.to.map)) arrivals.set(link.to.map, link.to.at)
  return Object.fromEntries(
    [...registry.rooms.values()].map((room) => [room.interior.id, createIndoorMap({ room, stairs: stairs.get(room.interior.id) ?? [], incoming: arrivals.get(room.interior.id), options })]),
  )
}
