import type { ScalarField } from "#/lib/engine/scalar-field"
import type { WindmillSurface } from "#/scripts/lib/windmill-surface-types"
type Props = Readonly<{ surface: WindmillSurface; terrain: ScalarField; point: readonly [number, number] }>

/** Preserve the road-side cap and blend the entire measured cross-section to the level turn, without changing terrain. */
export function getWindmillApproachSurfaceHeight(props: Props): number | Error {
  const surface = props.surface,
    x = props.point[0],
    z = props.point[1]
  if (!props.point.every(Number.isFinite)) return new Error("Invalid windmill surface point")
  if (![surface.level_bounds, surface.blend_bounds].some((bounds) => x >= bounds[0] && x <= bounds[2] && z >= bounds[1] && z <= bounds[3]))
    return new Error("Windmill surface point leaves its reserved corridors")
  if (x >= surface.start_x) return surface.elevation_m
  const roadHeight = props.terrain.sample(Math.min(x, surface.road_x), z) * surface.metres_per_tile
  if (!Number.isFinite(roadHeight)) return new Error("Non-finite windmill road surface")
  if (x <= surface.road_x) return roadHeight
  const fraction = (surface.start_x - x) / (surface.start_x - surface.road_x)
  const height = surface.elevation_m * (1 - fraction) + roadHeight * fraction
  if (!Number.isFinite(height)) return new Error("Non-finite windmill blend surface")
  return height
}
