import { smooth } from "#/lib/engine/smooth"
import { lerp } from "#/lib/engine/lerp"
import type { GroundHeightContext } from "#/world/scene/helpers/world/ground-height-types"
type Props = Pick<GroundHeightContext, "layout" | "z" | "riverDistance">

/** Keep the river bed separate from steep town embankments and the wider natural banks. */
export function getRiverGroundHeight(context: Props, height: number): number {
  const width = context.layout.riverHW
  const distance = context.riverDistance
  const embanked = context.layout.embanked
  const townRiver = smooth(embanked[0], embanked[0] + 4, context.z) * (1 - smooth(embanked[1] - 4, embanked[1], context.z))
  const slope = lerp(2.2, 0.06, townRiver)
  if (distance < width) return -1.55 + Math.min(1, (distance / width) ** 2) * 0.35
  if (distance < width + slope) return lerp(-1.2, height, smooth(0, 1, (distance - width) / slope))
  return height
}
