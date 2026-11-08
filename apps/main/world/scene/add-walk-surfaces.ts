import { walkSurfaces } from "#/world/scene/world"
import type { WalkSurface } from "#/world/maps/ground/types"

export function addWalkSurfaces(surfaces: readonly WalkSurface[]) {
  walkSurfaces.push(...surfaces)
}
