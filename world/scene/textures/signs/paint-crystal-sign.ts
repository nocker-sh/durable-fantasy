import type { PixelBuffer } from "#/lib/graphics/pixel-buffer"
import type { RGB } from "#/lib/graphics/pixel-types"
import { getIntegerRange } from "#/lib/engine/get-integer-range"
import { hexToRgb } from "#/lib/graphics/hex-to-rgb"

/** Rounded row widths retain the asymmetric light facets. */
export function paintCrystalSign(buffer: PixelBuffer): void {
  const ink = (x: number, y: number, color: RGB) => buffer.set({ x, y, color })
  const colors: readonly RGB[] = ["#3a6a88", "#8fd0e0", "#e8ffff"].map(hexToRgb)
  for (const y of getIntegerRange(3, 15)) {
    const width = y < 8 ? (y - 3) * 0.8 : (15 - y) * 0.55
    for (const x of getIntegerRange(Math.round(12 - width), Math.round(12 + width) + 1)) ink(x, y, x < 12 ? colors[2] : x === 12 ? colors[1] : colors[0])
  }
}
