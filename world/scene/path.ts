import { GridPathfinder, type V2 } from "../../lib/engine/pathfinder.ts"
import { blocked, WN, WR } from "./world"

const paths = new GridPathfinder(blocked, WN, WR)

/** Paths through the active map, in world units. */
export const findPath = (from: V2, to: V2, grid = false) => paths.find(from, to, grid)
