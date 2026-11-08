import type { Interior } from "#/world/town/interiors"
import type { HeightSampler } from "#/world/maps/ground/types"

/** This is the existing presentation floor, not the building's metric floor elevation. */
export function getInteriorFloorHeight(interior: Pick<Interior, "x0" | "z0">, groundHeight: HeightSampler): number {
  return groundHeight(interior.x0 + 1, interior.z0 + 1) + 0.02
}
