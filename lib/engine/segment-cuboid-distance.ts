import { getSegmentCuboidIntervalMinimum } from "#/lib/engine/get-segment-cuboid-interval-minimum"
import type { Cuboid } from "#/lib/engine/cuboid-subtraction"
import type { Point3 } from "#/lib/engine/cuboid-motion-types"
import type { SegmentCuboidDistanceQuery } from "#/lib/engine/segment-cuboid-distance-types"

const AXES: readonly number[] = [0, 1, 2]

/** Exact distance: split at box-plane crossings, then minimize each interval's squared distance. */
export function segmentCuboidDistance(box: Cuboid, from: Point3, to: Point3): number {
  const query: SegmentCuboidDistanceQuery = { low: [box.x0, box.bottom, box.z0], high: [box.x1, box.top, box.z1], origin: from, delta: [to[0] - from[0], to[1] - from[1], to[2] - from[2]] }
  const cuts = [0, 1]
  for (const axis of AXES) {
    if (query.delta[axis] === 0) continue
    for (const plane of [query.low[axis], query.high[axis]]) {
      const time = (plane - from[axis]) / query.delta[axis]
      if (time > 0 && time < 1) cuts.push(time)
    }
  }
  cuts.sort((first, second) => first - second)
  const minimum = cuts.reduce((best, end, index) => {
    if (index === 0) return best
    return Math.min(best, getSegmentCuboidIntervalMinimum({ query, start: cuts[index - 1], end }))
  }, Infinity)
  return Math.sqrt(minimum)
}
