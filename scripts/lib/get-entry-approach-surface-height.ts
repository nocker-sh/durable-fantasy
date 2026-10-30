import type { ScalarField } from "#/lib/engine/scalar-field"
import type { EntryApproachSurface } from "#/scripts/lib/entry-approach-surface-types"

type Props = Readonly<{ surface: EntryApproachSurface; terrain: ScalarField; point: readonly [number, number] }>

/** Keep the whole corner level, then meet the existing road cross-section at every point along its join. */
export function getEntryApproachSurfaceHeight(props: Props): number | Error {
  const surface = props.surface
  const point = props.point
  if (!point.every(Number.isFinite) || ![surface.levelBounds, surface.blendBounds].some((bounds) => point[0] >= bounds[0] && point[0] <= bounds[2] && point[1] >= bounds[1] && point[1] <= bounds[3]))
    return new Error("Entry surface point leaves its reserved corridors")
  const along = point[surface.alongAxis]
  if ((along - surface.start) * surface.direction <= 0) return surface.elevationM
  const isRoadCap = (along - surface.end) * surface.direction >= 0
  const roadAlong = isRoadCap ? along : surface.end
  const road = surface.alongAxis === 0 ? props.terrain.sample(roadAlong, point[1]) : props.terrain.sample(point[0], roadAlong)
  if (!Number.isFinite(road)) return new Error("Non-finite entry road surface")
  if (isRoadCap) return road * surface.metresPerTile
  const fraction = (along - surface.start) / (surface.end - surface.start)
  const elevation = surface.elevationM * (1 - fraction) + road * surface.metresPerTile * fraction

  if (!Number.isFinite(elevation)) return new Error("Non-finite entry surface")

  return elevation
}
