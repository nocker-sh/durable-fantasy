import { assertMapSpaceBounds } from "#/world/maps/assert-map-space-bounds"
import { getMapSpaceFrame } from "#/world/maps/get-map-space-frame"
import type { MapSpaceRegistry } from "#/world/maps/map-space-types"

/** Compare rotated extents in the parent's local metres; unknown domains and vertical limits remain unverified. */
export function assertMapSpaceContainment(maps: MapSpaceRegistry): void {
  for (const map of Object.values(maps)) assertMapSpaceBounds(map)
  for (const map of Object.values(maps)) {
    const space = map.space
    if (!space) continue
    const parent = Object.hasOwn(maps, space.parentMap) ? maps[space.parentMap] : undefined
    if (!parent || parent.id !== space.parentMap) throw new Error(`Map space parent is missing or miskeyed: ${space.parentMap}`)
    const bounds = parent.bounds
    if (!bounds) continue
    const size = getMapSpaceFrame(space).size,
      origin = space.frame.origin
    if (origin[0] < bounds.x0 || origin[2] < bounds.z0 || origin[0] + size[0] > bounds.x1 || origin[2] + size[1] > bounds.z1)
      throw new Error(`Map space extends outside parent: ${map.id} -> ${space.parentMap}`)
  }
}
