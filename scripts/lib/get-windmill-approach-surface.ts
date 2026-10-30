import type { WindmillSiteReview } from "#/scripts/lib/windmill-site-types"
import type { WindmillSurface } from "#/scripts/lib/windmill-surface-types"
type Props = Readonly<{ approach: NonNullable<WindmillSiteReview["approach"]>; metresPerTile: number; roadMinimumM: number; roadMaximumM: number }>

/** Start the blend beyond the level turn's west edge so the two reserved corridor surfaces agree where they overlap. */
export function getWindmillApproachSurface(props: Props): WindmillSurface | Error | null {
  const plan = props.approach.section
  if (!plan?.surface) return null
  const road = props.approach.points[2],
    turn = props.approach.points[1]
  const start_x = turn[0] - props.approach.widthM / props.metresPerTile / 2
  const blend_length_m = (start_x - road[0]) * props.metresPerTile
  const maximum_longitudinal_grade = Math.max(Math.abs(plan.turn_elevation_m - props.roadMinimumM), Math.abs(plan.turn_elevation_m - props.roadMaximumM)) / blend_length_m
  if (![start_x, blend_length_m, maximum_longitudinal_grade].every(Number.isFinite) || blend_length_m <= 0 || props.roadMinimumM > props.roadMaximumM)
    return new Error("Invalid windmill surface blend")
  if (maximum_longitudinal_grade > plan.maximum_grade) return new Error("Windmill surface exceeds its reserved full-width longitudinal grade")
  return {
    scope: plan.surface.scope,
    level_bounds: [...props.approach.bounds[0]],
    blend_bounds: [...props.approach.bounds[1]],
    start_x,
    road_x: road[0],
    elevation_m: plan.turn_elevation_m,
    metres_per_tile: props.metresPerTile,
    blend_length_m,
    maximum_longitudinal_grade,
  }
}
