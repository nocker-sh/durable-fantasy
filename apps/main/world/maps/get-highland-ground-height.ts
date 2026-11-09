import { fbm } from "#/lib/engine/fbm"
import { smooth } from "#/lib/engine/smooth"
import { hill } from "#/world/maps/landforms/hill"
import type { Layout } from "#/world/maps/layout-types"
type Props = Parameters<NonNullable<Layout["shape"]>>[0]

/** Long grassy swells: the knoll of the dead giant in the north-west, a lower rise in the south-east, a dip between. */
export function getHighlandGroundHeight(input: Props): number {
  const x = input.x,
    z = input.z
  const swell = (Math.sin(x * 0.16 + z * 0.07 + fbm({ x, y: z, scale: 0.06, seed: 41 }) * 3) * 0.5 + 0.5) * 0.9
  const knoll = hill({ x: x, z: z, cx: 13, cz: 13, r: 9, flat: 2.5, top: 2.4 })
  const rise = hill({ x: x, z: z, cx: 37, cz: 37, r: 8, flat: 2, top: 1.3 })
  const dip = smooth(7, 2, Math.hypot(x - 33, z - 13)) * 0.7
  return input.h + swell + knoll + rise - dip
}
