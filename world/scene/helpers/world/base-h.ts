import { fbm } from "#/lib/engine/fbm"
import type { Layout } from "#/world/maps/layout"
import { smooth } from "#/lib/engine/smooth"
import { lerp } from "#/lib/engine/lerp"

export function baseH(x: number, z: number, layout: Layout): number {
  const cxState = layout.town,
    cx = cxState[0],
    cz = cxState[1],
    rx = cxState[2],
    rz = cxState[3]
  const town = 1 - smooth(0, 1, Math.max(0, Math.hypot((x - cx) / rx, (z - cz) / rz) - 0.6) * 3)
  const amp = lerp(layout.relief[1], layout.relief[0], town)
  return (fbm({ x: x, y: z, scale: 0.075, seed: layout.seed }) - 0.5) * amp + 0.1
}
