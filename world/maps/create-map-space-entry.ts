import { getMapSpaceFrame } from "#/world/maps/get-map-space-frame"
import type { MapSpace, MapSpaceEntry } from "#/world/maps/map-space-types"

/** Known metric map dimensions define a local domain; an unplaced reference stays unbounded. */
export function createMapSpaceEntry(id: string, space: MapSpace | undefined): MapSpaceEntry {
  if (!space) return { id }
  getMapSpaceFrame(space)
  return { id, space, bounds: { x0: 0, z0: 0, x1: space.frame.width, z1: space.frame.depth } }
}
