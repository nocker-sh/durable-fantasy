import { smooth } from "#/lib/engine/smooth"
import { lerp } from "#/lib/engine/lerp"
import { segRoad } from "#/world/scene/helpers/world/seg-road"
import type { GroundHeightContext } from "#/world/scene/helpers/world/ground-height-types"
type Props = Pick<GroundHeightContext, "layout" | "x" | "z" | "roads" | "roadField">

/** Fade the map's landform off near the exact road centreline while retaining its sampled road-distance input. */
export function getShapedGroundHeight(context: Props, height: number): number {
  if (!context.layout.shape) return height
  const distance = Math.max(0, segRoad(context.x, context.z, context.roads))
  const shaped = context.layout.shape({ x: context.x, z: context.z, h: height, roadD: context.roadField.sample(context.x, context.z) })
  return lerp(height, shaped, smooth(0.4, 2.2, distance))
}
