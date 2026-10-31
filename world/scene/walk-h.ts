import { layout, walkSurfaces } from "#/world/scene/world"
import { groundH } from "#/world/scene/ground-h"
import { getWalkHeight } from "#/world/maps/ground/get-walk-height"

/** Height a character stands at. */
export function walkH(x: number, z: number): number {
  return getWalkHeight({ x, z, bridge: layout.value.bridge, groundHeight: groundH, surfaces: walkSurfaces })
}
