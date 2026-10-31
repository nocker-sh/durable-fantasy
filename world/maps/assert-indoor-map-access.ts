import { walkable } from "#/world/maps/walkable"
import { cellDistance } from "#/world/maps/cell-distance"
import { areMapCellsConnected } from "#/world/maps/are-map-cells-connected"
import type { MapDefinition } from "#/world/maps/types"

/** An adopted indoor map must offer reachable, unambiguous exits from a safe spawn. */
export function assertIndoorMapAccess(map: Pick<MapDefinition, "id" | "size" | "rows" | "spawn" | "warps">): void {
  if (!map.warps.length) throw new Error(`Indoor map has no exit: ${map.id}`)
  if (!walkable(map, map.spawn)) throw new Error(`Indoor map spawn is blocked: ${map.id}`)
  const targets = map.warps.map((warp) => warp.at)
  if (new Set(targets.map((cell) => cell.join(","))).size !== targets.length) throw new Error(`Indoor map warp triggers overlap: ${map.id}`)
  if (targets.some((cell) => !walkable(map, cell))) throw new Error(`Indoor map warp trigger is blocked: ${map.id}`)
  if (targets.some((cell) => cellDistance(map.spawn, cell) <= 1)) throw new Error(`Indoor map spawn touches a warp trigger: ${map.id}`)
  if (!areMapCellsConnected(map, map.spawn, targets)) throw new Error(`Indoor map exits are unreachable: ${map.id}`)
}
