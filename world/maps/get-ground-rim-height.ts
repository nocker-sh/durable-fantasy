import { smooth } from "#/lib/engine/smooth"
import { fbm } from "#/lib/engine/fbm"
import type { Layout } from "#/world/maps/layout-types"
type Props = Parameters<NonNullable<Layout["shape"]>>[0]

/** Only closed map edges raise the rim; an open coast must remain open to the next landscape. */
export function getGroundRimHeight(input: Props, openSides: string): number {
  const noise = (fbm({ x: input.x, y: input.z, scale: 0.2, seed: 17 }) - 0.5) * 2
  const sides = [
    { name: "w", distance: input.x },
    { name: "n", distance: input.z },
    { name: "e", distance: 48 - input.x },
    { name: "s", distance: 48 - input.z },
  ]
  return (
    sides.reduce((rim, side) => {
      if (openSides.includes(side.name)) return rim
      return Math.max(rim, smooth(5, 0.5, side.distance + noise))
    }, 0) * 2.2
  )
}
