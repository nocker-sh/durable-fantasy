import { PixelBuffer as PixBuf } from "#/lib/graphics/pixel-buffer"
import type { Palette } from "#/world/art/pixel-art"

export function sprite(rows: readonly string[], palette: Palette): PixBuf {
  const b = new PixBuf(rows[0].length, rows.length)
  rows.forEach((row, y) =>
    [...row].forEach((ch, x) => {
      if (palette[ch]) b.set({ x: x, y: y, color: palette[ch] })
    }),
  )
  return b
}
