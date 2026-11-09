import type { PixelBuffer } from "#/lib/graphics/pixel-buffer"
import type { RGB } from "#/lib/graphics/pixel-types"
import { getIntegerRange } from "#/lib/engine/get-integer-range"
import { RAMPS } from "#/world/scene/pix"

/** Preserve the bow and string overlap before placing the arrowhead. */
export function paintBowSign(buffer: PixelBuffer): void {
  const ink = (x: number, y: number, color: RGB) => buffer.set({ x, y, color })
  for (const y of getIntegerRange(3, 15)) {
    ink(Math.round(9 + Math.sin(((y - 3) / 12) * Math.PI) * 5), y, RAMPS.wood[3])
    ink(9, y, RAMPS.cLinen[4])
  }
  for (const x of getIntegerRange(5, 19)) ink(x, 9, RAMPS.wood[2])
  ink(19, 8, RAMPS.iron[3])
  ink(19, 9, RAMPS.iron[3])
  ink(20, 9, RAMPS.iron[3])
  ink(19, 10, RAMPS.iron[3])
}
