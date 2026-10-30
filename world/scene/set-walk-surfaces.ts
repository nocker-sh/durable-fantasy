import { walkSurfaces } from "#/world/scene/world"

export function setWalkSurfaces(surfaces: readonly { rect: readonly [number, number, number, number]; height: number }[]) {
  walkSurfaces.length = 0
  walkSurfaces.push(...surfaces)
}
