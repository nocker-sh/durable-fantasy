import type { PixelBuffer } from "#/lib/graphics/pixel-buffer"
import type { RGB } from "#/lib/graphics/pixel-types"
import { getIntegerRange } from "#/lib/engine/get-integer-range"
import { RAMPS } from "#/world/scene/pix"

/** The stepped iron silhouette is painted from its upper face down to its base. */
export function paintAnvilSign(buffer: PixelBuffer): void {
  const ink = (x: number, y: number, color: RGB) => buffer.set({ x, y, color })
  const iron = RAMPS.iron
  for (const x of getIntegerRange(5, 19)) ink(x, 6, iron[3])
  for (const x of getIntegerRange(4, 19)) ink(x, 7, iron[2])
  for (const x of getIntegerRange(8, 16)) ink(x, 8, iron[2])
  for (const y of getIntegerRange(9, 12)) for (const x of getIntegerRange(10, 14)) ink(x, y, iron[1])
  for (const x of getIntegerRange(7, 17)) ink(x, 12, iron[1])
}
