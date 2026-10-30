import type { PixelBuffer } from "#/lib/graphics/pixel-buffer"
import type { RGB } from "#/lib/graphics/pixel-types"
import { getIntegerRange } from "#/lib/engine/get-integer-range"
import { RAMPS } from "#/world/scene/pix"
import { pick } from "#/world/scene/pick"

/** Keep the glass neck separate from the round red fill and its highlight. */
export function paintPotionSign(buffer: PixelBuffer): void {
  const ink = (x: number, y: number, color: RGB) => buffer.set({ x, y, color })
  for (const y of getIntegerRange(4, 7)) {
    ink(11, y, RAMPS.glass[3])
    ink(12, y, RAMPS.glass[2])
  }
  for (const y of getIntegerRange(7, 15))
    for (const x of getIntegerRange(7, 17)) if (Math.hypot(x - 11.5, y - 10.5) < 4.2) ink(x, y, pick({ ramp: "cRed", b: 0.8 - (y - 7) / 10 - (x - 7) / 30, x: x, y: y, dither: 0.3 }))
  ink(10, 8, RAMPS.cLinen[4])
}
