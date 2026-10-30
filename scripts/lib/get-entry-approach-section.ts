import { getEntryApproachSurfaceSource } from "#/scripts/lib/get-entry-approach-surface-source"
import { getEntryApproachSurfacePlan } from "#/scripts/lib/get-entry-approach-surface-plan"
import { getEntryApproachEarthworks } from "#/scripts/lib/get-entry-approach-earthworks"
import { getEntryApproachRoadProfile } from "#/scripts/lib/get-entry-approach-road-profile"
import type { EntryApproachContext, EntryApproachPlan } from "#/scripts/lib/entry-approach-section-types"

type Props = EntryApproachContext & Readonly<{ approach: EntryApproachPlan }>

/** Check the authored level-and-blend plan without grading the source terrain or changing its acceptance limits. */
export function getEntryApproachSection(props: Props) {
  const source = getEntryApproachSurfaceSource(props)
  if (source instanceof Error) return source
  const surface = getEntryApproachSurfacePlan({ points: source.points, widthM: props.approach.width_m, elevationM: source.elevationM, metresPerTile: props.metres })
  if (surface instanceof Error) return surface
  const earthworks = getEntryApproachEarthworks({ surface, terrain: props.terrain })
  if (earthworks instanceof Error) return earthworks
  const road = getEntryApproachRoadProfile({ ...props, surface })
  if (road instanceof Error) return road
  const plan = props.approach.section
  if (road.maximumLongitudinalGrade > plan.maximum_longitudinal_grade + 1e-9) return new Error("Entry surface exceeds its reserved longitudinal grade")
  if (earthworks.cutM > plan.maximum_cut_m + 1e-9 || earthworks.fillM > plan.maximum_fill_m + 1e-9) return new Error("Entry surface exceeds its reserved earthworks")

  return { surface, earthworks, road }
}
