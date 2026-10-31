import { smooth } from "#/lib/engine/smooth"
import { lerp } from "#/lib/engine/lerp"
import type { GroundHeightContext } from "#/world/maps/ground/ground-height-types"
type Props = Pick<GroundHeightContext, "layout" | "x" | "z" | "plazaHeight">

/** Blend the plaza's fixed level into the surrounding unmodified terrain. */
export function getPlazaGroundHeight(context: Props, height: number): number {
  const plaza = context.layout.plaza
  const distance = Math.hypot(context.x - plaza[0], context.z - plaza[1])
  return lerp(context.plazaHeight, height, smooth(context.layout.plazaR, context.layout.plazaR + 3, distance))
}
