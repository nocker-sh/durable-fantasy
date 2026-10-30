import { segmentIntersectsRect } from "./segment-intersects-rect"
import { pointRectDistance } from "./point-rect-distance"
import type { Rect } from "./segment-distance-types"

/** 交差を含み、両端と矩形の全ての角から連続する線分への最短距離を求める。 */
export function segmentRectDistance(rect: Rect, from: ReadonlyArray<number>, to: ReadonlyArray<number>): number {
  const dx = to[0] - from[0],
    dz = to[1] - from[1]
  if (segmentIntersectsRect({ rect, from, to })) return 0
  const corners = [
    [rect[0], rect[1]],
    [rect[2], rect[1]],
    [rect[0], rect[3]],
    [rect[2], rect[3]],
  ]

  return corners.reduce(
    (distance, corner) => {
      const t = Math.max(0, Math.min(1, ((corner[0] - from[0]) * dx + (corner[1] - from[1]) * dz) / (dx * dx + dz * dz || 1)))
      return Math.min(distance, Math.hypot(corner[0] - from[0] - t * dx, corner[1] - from[1] - t * dz))
    },
    Math.min(pointRectDistance(from[0], from[1], rect), pointRectDistance(to[0], to[1], rect)),
  )
}
