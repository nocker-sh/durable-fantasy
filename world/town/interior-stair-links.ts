import { getInteriorStairRegistry } from "#/world/town/get-interior-stair-registry"
import { getInteriorStairEndpoints } from "#/world/town/get-interior-stair-endpoints"
import { getInteriorStairArrival } from "#/world/town/get-interior-stair-arrival"
import type { Interior } from "#/world/town/interiors"
import type { StairLink } from "#/world/town/interior-stair-types"

/** Stair travel starts on a landing and arrives clear of every return trigger. */
export function interiorStairLinks(interiors: readonly Interior[]): ReadonlyMap<string, readonly StairLink[]> {
  const registry = getInteriorStairRegistry(interiors)
  const endpoints = getInteriorStairEndpoints(registry)
  const links = new Map<string, StairLink[]>()
  for (const endpoint of endpoints) {
    const list = links.get(endpoint.map) ?? []
    if (list.some((link) => link.at[0] === endpoint.at[0] && link.at[1] === endpoint.at[1])) throw new Error(`Stair triggers overlap: ${endpoint.map}`)
    const target = registry.rooms.get(endpoint.targetMap)
    if (!target) throw new Error(`Stair destination map is missing: ${endpoint.targetMap}`)
    list.push({ at: endpoint.at, to: { map: endpoint.targetMap, at: getInteriorStairArrival({ room: target, start: endpoint.targetAt, endpoints }) } })
    links.set(endpoint.map, list)
  }
  return links
}
