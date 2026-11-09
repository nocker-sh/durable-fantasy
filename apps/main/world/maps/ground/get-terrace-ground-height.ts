import { lerp } from "#/lib/engine/lerp"
import { inRect } from "#/lib/engine/in-rect"
import { baseH } from "#/world/maps/ground/base-h"
import type { GroundHeightContext } from "#/world/maps/ground/ground-height-types"
type Props = Pick<GroundHeightContext, "layout" | "x" | "z">

/** The stair ramp overrides the terrace and meets the base ground beyond its last step. */
export function getTerraceGroundHeight(context: Props, height: number): number {
  const terrace = context.layout.terrace
  const terraced = inRect({ x: context.x, z: context.z, r: terrace }) ? terrace.h + (height - 0.1) * 0.25 : height
  const stairs = context.layout.stairs
  if (context.x >= stairs.x0 && context.x < stairs.x1 && context.z >= stairs.z0 && context.z <= stairs.z1) {
    const fraction = (context.z - stairs.z0) / (stairs.z1 - stairs.z0)
    return lerp(terrace.h, baseH(context.x, stairs.z1 + 0.1, context.layout), fraction)
  }
  return terraced
}
