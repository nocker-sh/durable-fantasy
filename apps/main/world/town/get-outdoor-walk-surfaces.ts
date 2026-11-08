import { HOUSES } from "#/world/town/houses"
import type { WalkSurface } from "#/world/maps/ground/types"

/** Authored entrance steps are world data, available before any house meshes are constructed. */
export function getOutdoorWalkSurfaces(map: string): readonly WalkSurface[] {
  return HOUSES.filter((house) => house.map === map).flatMap((house) => house.authored?.exterior?.steps ?? [])
}
