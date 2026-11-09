import { PixelBuffer as PixBuf } from "#/lib/graphics/pixel-buffer"
import type { RGB } from "#/lib/graphics/pixel-types"

/** The sprite as a dim silhouette, for an empty equipment slot. */
export function silhouette(b: PixBuf): PixBuf {
  const out = new PixBuf(b.w, b.h)
  const shade: RGB = [52, 56, 80]
  for (const y of Array.from({ length: b.h }, (_, index) => index))
    for (const x of Array.from({ length: b.w }, (_, index) => index)) if (b.alpha(x, y)) out.set({ x: x, y: y, color: shade, alpha: 160 })
  return out
}
