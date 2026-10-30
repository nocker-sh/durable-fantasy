import type { PixelBuffer } from "#/lib/graphics/pixel-buffer"
import type { RGB } from "#/lib/graphics/pixel-types"
import { getIntegerRange } from "#/lib/engine/get-integer-range"
import { RAMPS } from "#/world/scene/pix"

/** Preserve the beam, suspension and pan order of the balance emblem. */
export function paintScaleSign(buffer: PixelBuffer): void {
  const gold = RAMPS.gold
  const ink = (x: number, y: number, color: RGB) => buffer.set({ x, y, color })
  for (const y of getIntegerRange(4, 15)) ink(12, y, gold[2])
  for (const x of getIntegerRange(5, 20)) ink(x, 5, gold[3])
  for (const centerX of [6, 18]) {
    for (const y of getIntegerRange(6, 10)) ink(centerX, y, gold[1])
    for (const x of getIntegerRange(centerX - 2, centerX + 2 + 1)) ink(x, 10, gold[2])
  }
  for (const x of getIntegerRange(9, 16)) ink(x, 15, gold[2])
}
