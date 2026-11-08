import { assertMapConnection } from "#/world/maps/assert-map-connection"
import { areMapCellsConnected } from "#/world/maps/are-map-cells-connected"
import type { Cell, MapDefinition } from "#/world/maps/types"

/** Validate both ends, then search each map once for every incoming and outgoing cell. */
export function assertMapConnections(maps: Readonly<Record<string, MapDefinition>>): void {
  const arrivals = new Map<string, Cell[]>()
  for (const entry of Object.entries(maps)) {
    const map = entry[1]
    if (map.id !== entry[0]) throw new Error(`Map connection registry is miskeyed: ${entry[0]}`)
    if (new Set(map.warps.map((warp) => warp.at.join(","))).size !== map.warps.length) throw new Error(`Map connection triggers overlap: ${map.id}`)
    for (const warp of map.warps) {
      assertMapConnection({ source: map.id, warp, maps })
      const cells = arrivals.get(warp.to.map) ?? []
      cells.push(warp.to.at)
      arrivals.set(warp.to.map, cells)
    }
  }
  for (const map of Object.values(maps)) {
    if (!areMapCellsConnected(map, map.spawn, [...map.warps.map((warp) => warp.at), ...(arrivals.get(map.id) ?? [])])) throw new Error(`Map connection cells are unreachable: ${map.id}`)
  }
}
