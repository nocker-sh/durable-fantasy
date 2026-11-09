import type { PixelBuffer } from "#/lib/graphics/pixel-buffer"
import type { RGB } from "#/lib/graphics/pixel-types"
import { getIntegerRange } from "#/lib/engine/get-integer-range"
import { RAMPS } from "#/world/scene/pix"
import { pick } from "#/world/scene/pick"

/** Keep the drawstring and fastening above the shaded leather silhouette. */
export function paintBagSign(buffer: PixelBuffer): void {
  const gold = RAMPS.gold
  const ink = (x: number, y: number, color: RGB) => buffer.set({ x, y, color })
  for (const y of getIntegerRange(6, 15))
    for (const x of getIntegerRange(6, 18)) if (Math.hypot((x - 11.5) / 6, (y - 10.5) / 4.6) < 1) ink(x, y, pick({ ramp: "leather", b: 0.7 - (y - 6) / 14, x: x, y: y, dither: 0.3 }))
  for (const x of getIntegerRange(9, 15)) ink(x, 5, RAMPS.leather[1])
  ink(11, 4, gold[3])
  ink(12, 4, gold[3])
}
