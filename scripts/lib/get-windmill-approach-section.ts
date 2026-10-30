import { getWindmillApproachSurface } from "#/scripts/lib/get-windmill-approach-surface"
import { getWindmillRoadSeam } from "#/scripts/lib/get-windmill-road-seam"
import type { ScalarField } from "#/lib/engine/scalar-field"
import type { WindmillSiteReview } from "#/scripts/lib/windmill-site-types"
import { getWindmillSiteTerrain } from "#/scripts/lib/get-windmill-site-terrain"
import { getWindmillSectionSegment } from "#/scripts/lib/get-windmill-section-segment"
type Props = Readonly<{ review: WindmillSiteReview; terrain: ScalarField; metresPerTile: number }>

/** The road datum follows the supplied map terrain; the proposal does not grade or move the actual ground. */
export function getWindmillApproachSection(props: Props) {
  const approach = props.review.approach
  if (!approach?.section) return null
  const plan = approach.section
  if (plan.turn_elevation_m !== plan.yard_elevation_m) return new Error("Windmill section must keep its first leg level")
  const regions = getWindmillSiteTerrain(props)
  if (approach.points.length !== 3) return new Error("Invalid windmill approach section points")
  if (plan.yard_elevation_m < regions[0].maximum_m) return new Error("Windmill section yard is below existing terrain")
  const end = approach.points[2]
  const elevations = [plan.yard_elevation_m, plan.turn_elevation_m, props.terrain.sample(end[0], end[1]) * props.metresPerTile]
  const points = approach.points.map((point, index) => ({ point: [...point], elevation_m: elevations[index] }))
  const segments = points.slice(1).map((point, index) => getWindmillSectionSegment(points[index], point, props.metresPerTile))
  for (const segment of segments) {
    if (segment instanceof Error) return segment
    if (segment.grade > plan.maximum_grade) return new Error("Windmill approach exceeds its reserved centreline grade")
  }
  const seam = getWindmillRoadSeam({ approach, terrain: props.terrain, metresPerTile: props.metresPerTile, levelM: elevations[2] })
  if (seam instanceof Error) return seam
  const surface = getWindmillApproachSurface({ approach, metresPerTile: props.metresPerTile, roadMinimumM: seam.minimum_m, roadMaximumM: seam.maximum_m })
  if (surface instanceof Error) return surface
  return { scope: plan.scope, yard_elevation_m: plan.yard_elevation_m, anchors: points, anchor_segments: segments, seam, surface }
}
