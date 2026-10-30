import { OUTLINE, RAMPS } from "#/world/scene/pix"
import { PixelBuffer as PixBuf } from "#/lib/graphics/pixel-buffer"
import type { RGB } from "#/lib/graphics/pixel-types"
import { SIZE } from "#/world/art/icon-rules"

/** A diagonal blade from the lower left to the upper right with a crossguard and grip; `width` 2 is a broad blade. */
type Props = { length: number; guard: number; grip: RGB[]; iron?: RGB[]; width?: number; gripLen?: number }
export function blade(props: Props): PixBuf {
  const length = props.length
  const guard = props.guard
  const grip = props.grip
  const iron = props.iron === undefined ? RAMPS.iron : props.iron
  const width = props.width === undefined ? 1 : props.width
  const gripLen = props.gripLen === undefined ? 3 : props.gripLen
  const b = new PixBuf(SIZE + 8, SIZE + 8)
  const gold = RAMPS.gold
  const x0 = 4 + gripLen * 0.5,
    y0 = b.h - 6 - gripLen * 0.5
  const ox = Math.round(x0),
    oy = Math.round(y0)
  for (const k = { value: 0 }; k.value < length; k.value++) {
    const x = ox + 2 + k.value,
      y = oy - 2 - k.value
    b.set({ x: x, y: y, color: iron[4] })
    b.set({ x: x + 1, y: y, color: iron[3] })
    b.set({ x: x, y: y + 1, color: iron[2] })
    if (width > 1 && k.value < length - 2) {
      b.set({ x: x + 1, y: y + 1, color: iron[3] })
      b.set({ x: x + 2, y: y + 1, color: iron[1] })
    }
  }
  b.set({ x: ox + 2 + length, y: oy - 2 - length, color: iron[4] })
  for (const k = { value: -guard }; k.value <= guard; k.value++) b.set({ x: ox + 1 + k.value, y: oy - 1 + k.value, color: k.value === 0 ? gold[3] : gold[2] })
  for (const k = { value: 0 }; k.value < gripLen; k.value++) b.set({ x: ox - k.value, y: oy + k.value, color: grip[2 + (k.value & 1)] })
  b.set({ x: ox - gripLen, y: oy + gripLen, color: gold[3] })
  b.outline(OUTLINE)
  return b
}
