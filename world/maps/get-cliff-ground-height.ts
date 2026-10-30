import { smooth } from "#/lib/engine/smooth"
import { fbm } from "#/lib/engine/fbm"
import type { Layout } from "#/world/maps/layout-types"
type Props = Parameters<NonNullable<Layout["shape"]>>[0]

/** Keep the cliff's raised inland side and its separate drop toward the sea. */
export function getCliffGroundHeight(input: Props): number {
  const x = input.x,
    z = input.z
  const edge = 34 + Math.sin(z * 0.21) * 2 + (fbm({ x, y: z, scale: 0.2, seed: 11 }) - 0.5) * 2
  return x < edge ? input.h + smooth(4, 30, x) * 0.6 : input.h - 2.8 - smooth(edge, edge + 6, x) * 1.2
}
