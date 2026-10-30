import type { PixelBuffer } from "#/lib/graphics/pixel-buffer"
import type { RGB } from "#/lib/graphics/pixel-types"
import { getIntegerRange } from "#/lib/engine/get-integer-range"
import { RAMPS } from "#/world/scene/pix"
import { pick } from "#/world/scene/pick"

/** Paint the central metal strip over both colored halves. */
export function paintShieldSign(buffer: PixelBuffer): void {
  const gold = RAMPS.gold
  const ink = (x: number, y: number, color: RGB) => buffer.set({ x, y, color })
  for (const y of getIntegerRange(3, 15)) {
    const width = y < 10 ? 6 : 6 - (y - 9) * 1.2
    for (const x of getIntegerRange(Math.round(12 - width), Math.round(12 + width))) ink(x, y, pick({ ramp: x < 12 ? "cRed" : "cBlue", b: 0.6, x: x, y: y, dither: 0.2 }))
  }
  for (const y of getIntegerRange(3, 15)) ink(12, y, gold[3])
}
