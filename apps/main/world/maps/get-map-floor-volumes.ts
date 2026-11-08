import { getMapSpaceTransform } from "#/world/maps/get-map-space-transform"
import { assertMapFloorSpace } from "#/world/maps/assert-map-floor-space"
import type { MapSpaceRegistry } from "#/world/maps/map-space-types"
import type { MapFloorVolume } from "#/world/maps/floor-space-types"

/** Extrude only known floor material downwards from its finished floor; openings and display scales do not become solids. */
export function getMapFloorVolumes(maps: MapSpaceRegistry, mapId: string): readonly MapFloorVolume[] {
  const placement = getMapSpaceTransform(maps, mapId),
    space = maps[mapId].space
  if (!space || space.floor === undefined) return []
  assertMapFloorSpace(space)
  const floor = space.floor
  return floor.footprint.map((rect) => {
    const lower = placement.transform.toWorld([rect.x0, -floor.thicknessMetres, rect.z0]),
      upper = placement.transform.toWorld([rect.x1, 0, rect.z1])
    const bounds = { x0: Math.min(lower[0], upper[0]), z0: Math.min(lower[2], upper[2]), x1: Math.max(lower[0], upper[0]), z1: Math.max(lower[2], upper[2]) }
    if (lower[1] >= upper[1] || bounds.x1 <= bounds.x0 || bounds.z1 <= bounds.z0) throw new Error(`Map floor volume collapses in parent space: ${mapId}`)
    return { mapId, rootSpace: placement.rootSpace, undersideElevationMetres: lower[1], floorElevationMetres: upper[1], bounds }
  })
}
