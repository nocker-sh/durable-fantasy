import { getCatmullPath } from "#/lib/engine/get-catmull-path"
import type { Vector2Tuple } from "#/lib/engine/vector2-types"
import type { Road } from "#/world/maps/layout-types"

/** Dirt roads use the same curve samples as their worn trail centreline. */
export function getDirtRoad(points: readonly Vector2Tuple[], width = 0.85): Road {
  return { pts: getCatmullPath(points), w: width, kind: "dirt" }
}
