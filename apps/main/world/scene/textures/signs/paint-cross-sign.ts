import type { PixelBuffer } from "#/lib/graphics/pixel-buffer"
import type { RGB } from "#/lib/graphics/pixel-types"
import { getIntegerRange } from "#/lib/engine/get-integer-range"
import { RAMPS } from "#/world/scene/pix"

/** Paint the vertical stroke first so the horizontal stroke keeps its original overlap. */
export function paintCrossSign(buffer: PixelBuffer): void {
  const gold = RAMPS.gold
  const ink = (x: number, y: number, color: RGB) => buffer.set({ x, y, color })
  for (const y of getIntegerRange(3, 15)) {
    ink(11, y, gold[3])
    ink(12, y, gold[2])
  }
  for (const x of getIntegerRange(7, 17)) {
    ink(x, 6, gold[3])
    ink(x, 7, gold[2])
  }
}
