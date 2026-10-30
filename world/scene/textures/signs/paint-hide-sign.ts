import type { PixelBuffer } from "#/lib/graphics/pixel-buffer"
import type { RGB } from "#/lib/graphics/pixel-types"
import { getIntegerRange } from "#/lib/engine/get-integer-range"
import { pick } from "#/world/scene/pick"

/** Keep the irregular leather outline and its grain tied to pixel coordinates. */
export function paintHideSign(buffer: PixelBuffer): void {
  const ink = (x: number, y: number, color: RGB) => buffer.set({ x, y, color })
  for (const y of getIntegerRange(4, 14))
    for (const x of getIntegerRange(6, 18))
      if (Math.hypot((x - 11.5) / 6, (y - 9) / 5) < 1 + Math.sin(x + y) * 0.08) ink(x, y, pick({ ramp: "leather", b: 0.55 + Math.sin(x * 1.3) * 0.08, x: x, y: y, dither: 0.3 }))
}
