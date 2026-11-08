import type { PixelBuffer } from "#/lib/graphics/pixel-buffer"
import type { RGB } from "#/lib/graphics/pixel-types"
import { getIntegerRange } from "#/lib/engine/get-integer-range"
import { RAMPS } from "#/world/scene/pix"

/** Paint the sampled ring before the shaft and its teeth. */
export function paintKeySign(buffer: PixelBuffer): void {
  const gold = RAMPS.gold
  const ink = (x: number, y: number, color: RGB) => buffer.set({ x, y, color })
  for (const angle of getIntegerRange(0, 16)) ink(Math.round(8 + Math.cos(angle / 2.5) * 2.5), Math.round(9 + Math.sin(angle / 2.5) * 2.5), gold[3])
  for (const x of getIntegerRange(11, 19)) ink(x, 9, gold[2])
  ink(17, 10, gold[2])
  ink(17, 11, gold[2])
  ink(15, 10, gold[2])
}
