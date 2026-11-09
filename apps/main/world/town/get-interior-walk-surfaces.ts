import { subtractRectangles } from "#/lib/engine/rectangle-subtraction"
import type { Interior } from "#/world/town/interiors"
import type { WalkSurface } from "#/world/maps/ground/types"

/** Preserve floor openings; a floor's outer rectangle must not fill stair voids. */
export function getInteriorWalkSurfaces(interior: Pick<Interior, "x0" | "z0" | "x1" | "z1" | "floorOpenings">, height: number): readonly WalkSurface[] {
  return subtractRectangles({ x0: interior.x0, z0: interior.z0, x1: interior.x1, z1: interior.z1 }, interior.floorOpenings ?? []).map((rect) => ({
    rect: [rect.x0, rect.z0, rect.x1, rect.z1],
    height,
  }))
}
