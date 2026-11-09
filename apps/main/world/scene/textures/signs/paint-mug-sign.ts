import type { PixelBuffer } from "#/lib/graphics/pixel-buffer"
import type { RGB } from "#/lib/graphics/pixel-types"
import { getIntegerRange } from "#/lib/engine/get-integer-range"
import { RAMPS } from "#/world/scene/pix"

/** Keep the light rim above the shaded body and its separate handle. */
export function paintMugSign(buffer: PixelBuffer): void {
  const gold = RAMPS.gold
  const ink = (x: number, y: number, color: RGB) => buffer.set({ x, y, color })
  for (const y of getIntegerRange(5, 14)) for (const x of getIntegerRange(8, 15)) ink(x, y, y < 7 ? RAMPS.cLinen[4] : gold[x < 10 ? 3 : 2])
  for (const y of getIntegerRange(7, 12)) {
    ink(15, y, gold[1])
    ink(17, y, gold[1])
  }
  ink(16, 7, gold[1])
  ink(16, 11, gold[1])
}
