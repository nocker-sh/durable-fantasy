import { fbm } from "#/lib/engine/fbm"
import { smooth } from "#/lib/engine/smooth"
import type { Layout } from "#/world/maps/layout-types"
type Props = Parameters<NonNullable<Layout["shape"]>>[0]

/** A flat bed of salt just above the water line, with shallow brine sheets sunk a hand's depth under it. */
export function getSaltGroundHeight(input: Props): number {
  const x = input.x,
    z = input.z
  const flat = -0.62 + (input.h - 0.1) * 0.25
  const brine = smooth(0.56, 0.62, fbm({ x, y: z, scale: 0.05, seed: 71 }) + (fbm({ x, y: z, scale: 0.4, seed: 72 }) - 0.5) * 0.06)
  return flat + (-1.12 - flat) * brine
}
