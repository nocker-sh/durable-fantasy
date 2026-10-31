import { walkSurfaces } from "#/world/scene/world"
import type { WalkSurface } from "#/world/maps/ground/types"

export function setWalkSurfaces(surfaces: readonly WalkSurface[]) {
  walkSurfaces.length = 0
  walkSurfaces.push(...surfaces)
}
