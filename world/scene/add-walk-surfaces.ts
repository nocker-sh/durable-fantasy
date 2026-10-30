import { walkSurfaces } from "#/world/scene/world"

export function addWalkSurfaces(surfaces: readonly { rect: readonly [number, number, number, number]; height: number }[]) {
  walkSurfaces.push(...surfaces)
}
