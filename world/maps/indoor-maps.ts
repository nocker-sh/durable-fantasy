import type { MapDefinition } from "#/world/maps/types"
import { INDOOR_SIZE } from "#/world/town/interior-rules"
import { interiorRows } from "#/world/town/interior-rows"
import { outsideDoor } from "#/world/town/outside-door"
import type { Interior } from "#/world/town/interiors"
import { interiorStairLinks } from "../town/interior-stairs"

/** The same map definitions are consumed by server movement and the client scene. */
export function indoorMaps(interiors: readonly Interior[], options: { sprites: string; name: (it: Interior) => string; npcs: (it: Interior) => MapDefinition["npcs"] }): Record<string, MapDefinition> {
  const stairs = interiorStairLinks(interiors)
  const destinations = new Map<string, MapDefinition>()
  for (const it of interiors) {
    if (destinations.has(it.id)) throw new Error(`Duplicate indoor map: ${it.id}`)
    const warps = [...(it.floor === 0 ? [{ at: it.door, to: { map: it.house.map, at: outsideDoor(it.house).arrive } }] : []), ...(stairs.get(it.id) ?? [])]
    const incoming = [...stairs.values()].flat().find((link) => link.to.map === it.id)
    if (it.floor > 0 && !incoming) throw new Error(`Indoor upper floor has no stair arrival: ${it.id}`)
    destinations.set(it.id, {
      id: it.id,
      name: options.name(it),
      kind: "indoor",
      size: INDOOR_SIZE,
      rows: interiorRows(it),
      places: {},
      npcs: options.npcs(it),
      warps,
      spawn: it.floor === 0 ? it.arrive : incoming!.to.at,
      assets: { sprites: options.sprites },
    })
  }
  return Object.fromEntries(destinations)
}
