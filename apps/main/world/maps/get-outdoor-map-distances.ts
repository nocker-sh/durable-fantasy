import type { MapDefinition } from "#/world/maps/types"

/** Breadth-first distance in crossings, retaining declared warp order without shifting the queue. */
export function getOutdoorMapDistances(maps: Readonly<Record<string, MapDefinition>>, from = "phanthiet"): ReadonlyMap<string, number> {
  const distances = new Map<string, number>([[from, 0]]),
    pending = [{ id: from, distance: 0 }]
  for (const current of pending) {
    const map = Object.hasOwn(maps, current.id) ? maps[current.id] : undefined
    if (!map) throw new Error(`Outdoor connection has no map: ${current.id}`)
    for (const warp of map.warps)
      if (!distances.has(warp.to.map)) {
        distances.set(warp.to.map, current.distance + 1)
        pending.push({ id: warp.to.map, distance: current.distance + 1 })
      }
  }
  return distances
}
