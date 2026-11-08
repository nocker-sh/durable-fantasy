import type { PixelBuffer } from "#/lib/graphics/pixel-buffer"
import type { RGB } from "#/lib/graphics/pixel-types"
import { getIntegerRange } from "#/lib/engine/get-integer-range"
import { pick } from "#/world/scene/pick"

/** The clipped loaf silhouette retains its scored top and row-based shading. */
export function paintBreadSign(buffer: PixelBuffer): void {
  const ink = (x: number, y: number, color: RGB) => buffer.set({ x, y, color })
  for (const y of getIntegerRange(6, 13))
    for (const x of getIntegerRange(5, 19)) {
      if (Math.hypot((x - 12) / 7, (y - 9.5) / 3.6) > 1) continue
      const brightness = 0.75 - ((y - 6) / 7) * 0.4 + ((x - 4) % 4 === 0 && y < 9 ? -0.35 : 0)
      ink(x, y, pick({ ramp: "cMustard", b: brightness, x: x, y: y, dither: 0.3 }))
    }
}
