import { GridPathfinder, type V2 } from "#/lib/engine/pathfinder"
import { blocked, WN, WR } from "#/world/scene/world"

const paths = new GridPathfinder({ blocked, size: WN, resolution: WR, clearance: 0.2 })

/** Paths through the active map, in world units. */
export const findPath = (from: V2, to: V2, grid = false) => paths.find(from, to, grid)
