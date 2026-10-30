import type { ScalarField } from "#/lib/engine/scalar-field"
import { scalarFieldRange } from "#/lib/engine/scalar-field-range"
import type { WindmillSiteReview } from "#/scripts/lib/windmill-site-types"
type Props = Readonly<{ approach: NonNullable<WindmillSiteReview["approach"]>; terrain: ScalarField; metresPerTile: number; levelM: number }>

/** Measure the complete ungraded join; a centre point at road height does not make both edges flush. */
export function getWindmillRoadSeam(props: Props) {
  const end = props.approach.points.at(-1),
    previous = props.approach.points.at(-2)
  if (!end || !previous || ![props.metresPerTile, props.levelM, props.approach.widthM].every(Number.isFinite) || props.metresPerTile <= 0 || props.approach.widthM <= 0)
    return new Error("Invalid windmill road seam")
  if (end[1] !== previous[1] || end[0] === previous[0]) return new Error("Windmill road seam needs the reserved east-west final leg")
  const half = props.approach.widthM / props.metresPerTile / 2
  const bounds = [end[0], end[1] - half, end[0], end[1] + half] satisfies readonly [number, number, number, number]
  const limit = (props.terrain.size - 1.001) / props.terrain.resolution
  if (!bounds.every(Number.isFinite) || bounds[0] < 0 || bounds[1] < 0 || bounds[2] > limit || bounds[3] > limit) return new Error("Windmill road seam exceeds sampled terrain")
  const range = scalarFieldRange(props.terrain, bounds)
  const minimum_m = range.min * props.metresPerTile,
    maximum_m = range.max * props.metresPerTile
  const cut_m = Math.max(0, maximum_m - props.levelM),
    fill_m = Math.max(0, props.levelM - minimum_m)
  if (![minimum_m, maximum_m, cut_m, fill_m].every(Number.isFinite)) return new Error("Unbounded windmill road seam heights")
  return { scope: "ungraded_road_join", bounds, minimum_m, maximum_m, cut_m, fill_m }
}
