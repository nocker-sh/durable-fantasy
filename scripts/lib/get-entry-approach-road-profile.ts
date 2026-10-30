import { canCoverRectangleWithPath } from "#/lib/engine/can-cover-rectangle-with-path"
import { scalarFieldRange } from "#/lib/engine/scalar-field-range"
import type { EntryApproachContext, EntryApproachPlan } from "#/scripts/lib/entry-approach-section-types"
import type { EntryApproachSurface } from "#/scripts/lib/entry-approach-surface-types"

type Props = EntryApproachContext & Readonly<{ approach: EntryApproachPlan; surface: EntryApproachSurface }>

/** Preserve the full measured road seam and keep the unchanged cap inside the referenced road. */
export function getEntryApproachRoadProfile(props: Props) {
  const approach = props.approach
  const road = props.roads[approach.section.road_index]
  const end = approach.points_tiles.at(-1)
  if (!road || !end || !Number.isFinite(road.w) || road.w <= 0 || road.pts.length < 2 || road.pts.some((point) => !point.every(Number.isFinite)))
    return new Error("Entry surface has no referenced road")
  const half = approach.width_m / props.metres / 2
  if (!canCoverRectangleWithPath({ bounds: [end[0] - half, end[1] - half, end[0] + half, end[1] + half], points: road.pts, radius: road.w }))
    return new Error("Entry surface road cap is not certified inside its referenced road")
  const surface = props.surface
  const bounds: [number, number, number, number] = [...surface.blendBounds]
  bounds[surface.alongAxis] = surface.end
  bounds[surface.alongAxis + 2] = surface.end
  const range = scalarFieldRange(props.terrain, bounds)
  const minimumM = range.min * props.metres,
    maximumM = range.max * props.metres
  const blendLengthM = Math.abs(surface.end - surface.start) * props.metres

  return { minimumM, maximumM, blendLengthM, maximumLongitudinalGrade: Math.max(Math.abs(minimumM - surface.elevationM), Math.abs(maximumM - surface.elevationM)) / blendLengthM }
}
