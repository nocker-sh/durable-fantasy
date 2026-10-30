import { fbm } from "#/lib/engine/fbm"
import type { Layout } from "#/world/maps/layout-types"
type Props = Parameters<NonNullable<Layout["shape"]>>[0]

/** The pass stays low along the road and rises with distance from its edge. */
export function getPassGroundHeight(input: Props): number {
  const distance = Math.max(0, input.roadD - 2)
  return input.h + Math.min(5, distance * distance * 0.06) + (fbm({ x: input.x, y: input.z, scale: 0.3, seed: 13 }) - 0.5) * Math.min(1, distance * 0.2)
}
