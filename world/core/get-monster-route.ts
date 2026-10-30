import type { Vector2Tuple } from "#/lib/engine/vector2-types"
import { getMonsterGridRoute } from "#/world/core/get-monster-grid-route"
import { getMonsterRouteInputError } from "#/world/core/get-monster-route-input-error"
import { getMonsterSegmentError } from "#/world/core/get-monster-segment-error"
type Props = { from: Vector2Tuple; to: Vector2Tuple; area: readonly [number, number, number, number]; radius: number; free: (x: number, z: number) => boolean }
export type MonsterRoute = { points: ReadonlyArray<Vector2Tuple>; lengths: ReadonlyArray<number>; distance: number }
/** One swept-footprint proof includes both endpoints; a blocked direct route still needs separately checked rests and a verified detour. */
export function getMonsterRoute(props: Props): MonsterRoute | Error {
  const invalid = getMonsterRouteInputError(props)
  if (invalid) return invalid
  if (!props.free(...props.from) || !props.free(...props.to)) return new Error("Monster resting point is blocked")
  if (getMonsterSegmentError(props) === null) {
    const distance = Math.hypot(props.to[0] - props.from[0], props.to[1] - props.from[1])
    return { points: [props.from, props.to], lengths: [distance], distance }
  }
  if (getMonsterSegmentError({ ...props, to: props.from }) || getMonsterSegmentError({ ...props, from: props.to })) return new Error("Monster resting footprint is blocked")
  const points = getMonsterGridRoute(props)
  if (points instanceof Error) return points
  for (const index of points.keys()) {
    if (index === 0) continue
    const clearanceError = getMonsterSegmentError({ from: points[index - 1], to: points[index], radius: props.radius, free: props.free })
    if (clearanceError) return clearanceError
  }
  const lengths = points.slice(1).map((point, index) => Math.hypot(point[0] - points[index][0], point[1] - points[index][1]))
  return { points, lengths, distance: lengths.reduce((sum, length) => sum + length, 0) }
}
