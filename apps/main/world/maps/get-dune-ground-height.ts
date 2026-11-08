import { fbm } from "#/lib/engine/fbm"
import type { Layout } from "#/world/maps/layout-types"
type Props = Parameters<NonNullable<Layout["shape"]>>[0]

/** Preserve the wind-aligned dune ridges independently of the map's roads and atmosphere. */
export function getDuneGroundHeight(input: Props): number {
  const x = input.x,
    z = input.z
  return input.h + (Math.sin(x * 0.33 + z * 0.12 + fbm({ x, y: z, scale: 0.08, seed: 9 }) * 4) * 0.5 + 0.5) ** 2 * 1.5
}
