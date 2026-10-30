import type { PixelBuffer } from "#/lib/graphics/pixel-buffer"
import type { RGB } from "#/lib/graphics/pixel-types"
import { getIntegerRange } from "#/lib/engine/get-integer-range"
import { RAMPS } from "#/world/scene/pix"

/** Paint both blades before their round handles; rounded samples may revisit a pixel. */
export function paintNeedleSign(buffer: PixelBuffer): void {
  const gold = RAMPS.gold
  const ink = (x: number, y: number, color: RGB) => buffer.set({ x, y, color })
  for (const step of getIntegerRange(0, 9)) {
    ink(6 + step, 4 + step, RAMPS.iron[3])
    ink(17 - step, 4 + step, RAMPS.iron[2])
  }
  for (const centerX of [7, 16]) for (const angle of getIntegerRange(0, 12)) ink(Math.round(centerX + Math.cos(angle / 2) * 2), Math.round(14 + Math.sin(angle / 2) * 1.6), gold[2])
}
