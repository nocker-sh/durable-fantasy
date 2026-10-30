import { lerp } from "#/lib/engine/lerp"
import { layout } from "#/world/scene/world"
import { groundH } from "#/world/scene/ground-h"

export function bridgeDeckH(x: number): number {
  const B = layout.value.bridge
  const ha = groundH(B.x0 - 0.2, 22),
    hb = groundH(B.x1 + 0.2, 22)
  const t = (x - B.x0) / (B.x1 - B.x0)
  return lerp(ha, hb, t) + Math.sin(Math.PI * Math.min(1, Math.max(0, t))) * 0.35 + 0.04
}
