import { SpatialFrame } from "#/lib/engine/spatial-frame"
import type { MapSpace } from "#/world/maps/map-space-types"

/** Validate display conversion metadata before constructing its physical frame. */
export function getMapSpaceFrame(space: MapSpace): SpatialFrame {
  if (!Number.isFinite(space.metresPerPlanarUnit) || space.metresPerPlanarUnit <= 0) throw new RangeError("Invalid map-space planar scale")
  if (!Array.isArray(space.planarOrigin) || space.planarOrigin.length !== 2 || !Number.isFinite(space.planarOrigin[0]) || !Number.isFinite(space.planarOrigin[1]))
    throw new RangeError("Invalid map-space planar origin")
  return new SpatialFrame(space.frame)
}
