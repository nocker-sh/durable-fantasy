import { PixelBuffer as PixBuf } from "#/lib/graphics/pixel-buffer"
import { N } from "#/world/scene/world"
import { PPU } from "#/world/scene/textures/palette"
import { ashAt } from "#/world/scene/helpers/terrain/ash-at"
import { groundColor } from "#/world/scene/helpers/terrain/ground-color"

/** Paint rows y0..y1 of the ground into `buf` (whose first row is y0). */
export function paintRows(buf: PixBuf, y0: number, y1: number) {
  const S = N * PPU
  for (const sy = { value: y0 }; sy.value < y1; sy.value++) {
    const z = (sy.value + 0.5) / PPU
    for (const sx = { value: 0 }; sx.value < S; sx.value++) {
      const x = (sx.value + 0.5) / PPU
      // Opaque ash hides the ground pixel completely; avoid painting what it covers.
      buf.set({ x: sx.value, y: sy.value - y0, color: ashAt({ x: x, z: z, sx: sx.value, sy: sy.value }) ?? groundColor({ x: x, z: z, sx: sx.value, sy: sy.value }) })
    }
  }
}
