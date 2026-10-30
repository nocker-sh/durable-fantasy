import { getIntegerRange } from "#/lib/engine/get-integer-range"
import { getNearestSegmentPoint } from "#/lib/engine/get-nearest-segment-point"
import type { Vector2Tuple } from "#/lib/engine/vector2-types"
import type { Road } from "#/world/maps/layout-types"

/** Keep road and segment order on distance ties; without a segment, return the original point. */
export function getNearestRoadPoint(roads: readonly Road[], point: Vector2Tuple): Vector2Tuple {
  const closest = { point, distance: Infinity }
  for (const road of roads)
    for (const index of getIntegerRange(0, road.pts.length - 1)) {
      const candidate = getNearestSegmentPoint({ from: road.pts[index], to: road.pts[index + 1], point })
      const distance = Math.hypot(candidate[0] - point[0], candidate[1] - point[1])
      if (distance < closest.distance) {
        closest.distance = distance
        closest.point = candidate
      }
    }
  return closest.point
}
