import type { SegmentCuboidDistanceInterval as Props } from "#/lib/engine/segment-cuboid-distance-types"

const AXES: readonly number[] = [0, 1, 2]

/** Between consecutive face crossings, compare endpoints and the clamped stationary point without sampling away a narrow minimum. */
export function getSegmentCuboidIntervalMinimum(props: Props): number {
  const query = props.query
  const middle = (props.start + props.end) / 2
  const coefficients = { linear: 0, quadratic: 0 }
  for (const axis of AXES) {
    const origin = query.origin[axis]
    const coordinate = origin + query.delta[axis] * middle
    const plane = coordinate < query.low[axis] ? query.low[axis] : coordinate > query.high[axis] ? query.high[axis] : null
    if (plane === null) continue
    coefficients.linear += (origin - plane) * query.delta[axis]
    coefficients.quadratic += query.delta[axis] ** 2
  }
  const stationary = coefficients.quadratic ? Math.max(props.start, Math.min(props.end, -coefficients.linear / coefficients.quadratic)) : props.start
  const squaredDistance = (time: number) =>
    query.origin.reduce((sum, origin, axis) => sum + Math.max(query.low[axis] - origin - query.delta[axis] * time, origin + query.delta[axis] * time - query.high[axis], 0) ** 2, 0)
  const endpoints = Math.min(squaredDistance(props.start), squaredDistance(props.end))
  if (stationary === props.start || stationary === props.end) return endpoints
  return Math.min(endpoints, squaredDistance(stationary))
}
