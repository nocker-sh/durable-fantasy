import { lerp } from "#/lib/engine/lerp"
import { inRect } from "#/world/scene/in-rect"
import { baseH } from "#/world/scene/helpers/world/base-h"
import type { GroundHeightContext } from "#/world/scene/helpers/world/ground-height-types"
type Props = Pick<GroundHeightContext, "layout" | "x" | "z" | "riverDistance">

/** The ledge respects the river opening; its stair ramp overrides the ledge where their rectangles meet. */
export function getLavoirGroundHeight(context: Props, height: number): number {
  const ledge = context.layout.lavoir
  const ledgeHeight = inRect({ x: context.x, z: context.z, r: ledge }) && context.riverDistance >= context.layout.riverHW - 0.02 ? ledge.h : height
  const stairs = context.layout.lavStairs
  if (!inRect({ x: context.x, z: context.z, r: stairs })) return ledgeHeight
  const fraction = (context.z - stairs.z0) / (stairs.z1 - stairs.z0)
  return lerp(ledge.h, baseH(context.x, stairs.z1 + 0.1, context.layout), fraction)
}
