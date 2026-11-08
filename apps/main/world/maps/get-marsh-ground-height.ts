import { fbm } from "#/lib/engine/fbm"
import { smooth } from "#/lib/engine/smooth"
import { MARSH_PONDS } from "#/world/maps/marsh-ponds"
import type { Layout } from "#/world/maps/layout-types"
type Props = Parameters<NonNullable<Layout["shape"]>>[0]

/** Low wet ground with ponds sunk under the water line; the banks shelve, the middles are deep. */
export function getMarshGroundHeight(input: Props): number {
  const x = input.x,
    z = input.z
  // ragged banks: bays and spits at two sizes, so no pond is round
  const ragged = (fbm({ x, y: z, scale: 0.16, seed: 52 }) - 0.5) * 6 + (fbm({ x, y: z, scale: 0.5, seed: 53 }) - 0.5) * 2
  const sunk = MARSH_PONDS.reduce((deepest, pond) => Math.max(deepest, smooth(pond[2], pond[2] * 0.35, Math.hypot(x - pond[0], z - pond[1]) + ragged)), 0)
  return input.h - 0.25 + (-1.9 - input.h) * sunk
}
