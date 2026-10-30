import { OUTLINE, RAMPS } from "#/world/scene/pix"
import { PixelBuffer as PixBuf } from "#/lib/graphics/pixel-buffer"
import type { RGB } from "#/lib/graphics/pixel-types"
import { SIZE } from "#/world/art/icon-rules"

/** A broad single-edged blade, its back straight and its edge swelling to a squared tip. */
export function machete(iron: RGB[]): PixBuf {
  const b = new PixBuf(SIZE, SIZE)
  const wood = RAMPS.wood
  for (const k = { value: 0 }; k.value < 4; k.value++) b.set({ x: 4 + k.value, y: 19 - k.value, color: wood[2 + (k.value & 1)] })
  for (const k = { value: 0 }; k.value < 11; k.value++) {
    const x = 8 + k.value,
      y = 15 - k.value
    const w = 1 + Math.min(2, Math.floor(k.value / 3))
    for (const t = { value: 0 }; t.value <= w; t.value++) {
      b.set({ x: x + t.value, y: y + t.value, color: t.value === w ? iron[4] : t.value === 0 ? iron[2] : iron[3] })
      b.set({ x: x + t.value + 1, y: y + t.value, color: t.value === w ? iron[4] : iron[3] })
    }
  }
  b.outline(OUTLINE)
  return b
}
