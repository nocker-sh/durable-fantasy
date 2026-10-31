import { getStraightEntryApproachSurfacePlan } from "#/scripts/lib/get-straight-entry-approach-surface-plan"
import type { EntryApproachSurface } from "#/scripts/lib/entry-approach-surface-types"

type Point = readonly [number, number]
type Props = Readonly<{ points: readonly Point[]; widthM: number; elevationM: number; metresPerTile: number; scope?: "level_turn_road_profile" | "straight_road_profile" }>

/** Keep the existing turn profile as the default; explicitly straight approaches have no invented level corner. */
export function getEntryApproachSurfacePlan(props: Props): EntryApproachSurface | Error {
  if (props.scope === "straight_road_profile") return getStraightEntryApproachSurfacePlan(props)
  if (
    props.points.length !== 3 ||
    ![props.widthM, props.elevationM, props.metresPerTile].every(Number.isFinite) ||
    props.widthM <= 0 ||
    props.metresPerTile <= 0 ||
    props.points.some((point) => !point.every(Number.isFinite))
  )
    return new Error("Invalid entry surface dimensions")
  const first = props.points[0],
    turn = props.points[1],
    road = props.points[2]
  const acrossAxis = first[0] !== turn[0] ? 0 : 1
  const alongAxis = acrossAxis === 0 ? 1 : 0
  if (first[alongAxis] !== turn[alongAxis] || turn[acrossAxis] !== road[acrossAxis] || first[acrossAxis] === turn[acrossAxis] || turn[alongAxis] === road[alongAxis])
    return new Error("Entry surface needs two perpendicular straight legs")
  const direction = road[alongAxis] > turn[alongAxis] ? 1 : -1
  const half = props.widthM / props.metresPerTile / 2
  const start = turn[alongAxis] + direction * half
  if ((road[alongAxis] - start) * direction <= 0) return new Error("Entry blend has no length beyond its level turn")
  const bounds = (from: Point, to: Point): readonly [number, number, number, number] => [
    Math.min(from[0], to[0]) - half,
    Math.min(from[1], to[1]) - half,
    Math.max(from[0], to[0]) + half,
    Math.max(from[1], to[1]) + half,
  ]

  return { levelBounds: bounds(first, turn), blendBounds: bounds(turn, road), alongAxis, direction, start, end: road[alongAxis], elevationM: props.elevationM, metresPerTile: props.metresPerTile }
}
