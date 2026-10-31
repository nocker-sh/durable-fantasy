import { getMapSpaceFrame } from "#/world/maps/get-map-space-frame"
import type { MapSpaceEntry } from "#/world/maps/map-space-types"

/** Explicit domains must be finite positive rectangles inside their own local metric frame. */
export function assertMapSpaceBounds(entry: MapSpaceEntry): void {
  const bounds = entry.bounds
  if (!bounds) return
  if (![bounds.x0, bounds.z0, bounds.x1, bounds.z1].every(Number.isFinite) || bounds.x1 <= bounds.x0 || bounds.z1 <= bounds.z0) throw new Error(`Invalid map space bounds: ${entry.id}`)
  if (!entry.space) return
  getMapSpaceFrame(entry.space)
  if (bounds.x0 < 0 || bounds.z0 < 0 || bounds.x1 > entry.space.frame.width || bounds.z1 > entry.space.frame.depth) throw new Error(`Map space bounds exceed local frame: ${entry.id}`)
}
