import type { Cell, MapDefinition } from "#/world/maps/types"

/** Enter a field from its nearest town-facing neighbor; never invent a missing return connection. */
export function getOutdoorSpawn(map: MapDefinition, maps: Readonly<Record<string, MapDefinition>>, distances: ReadonlyMap<string, number>): Cell | undefined {
  if (map.kind !== "field" || !map.warps.length) return undefined
  const near = [...map.warps].sort((a, b) => (distances.get(a.to.map) ?? 99) - (distances.get(b.to.map) ?? 99))[0]
  const neighbor = Object.hasOwn(maps, near.to.map) ? maps[near.to.map] : undefined
  const returning = neighbor?.warps.find((warp) => warp.to.map === map.id)
  if (!returning) throw new Error(`Outdoor crossing has no return: ${map.id} / ${near.to.map}`)
  return returning.to.at
}
