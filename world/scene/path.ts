import type { Vector2Tuple } from "#/lib/engine/vector2-types"
import { GridPathfinder } from "#/lib/engine/grid-pathfinder"
import { blocked } from "#/world/scene/world"
import { WN, WR } from "#/world/maps/ground/rules"

const paths = new GridPathfinder({ blocked, size: WN, resolution: WR, clearance: 0.2 })

/** Paths through the active map, in world units. */
export const findPath = (from: Vector2Tuple, to: Vector2Tuple, grid = false) => paths.find(from, to, grid)
