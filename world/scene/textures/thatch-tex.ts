import { PixelBuffer as PixBuf } from "#/lib/graphics/pixel-buffer"
import { hash2 } from "#/lib/engine/hash2"
import { vnoise } from "#/lib/engine/vnoise"
import { lvl } from "#/world/scene/textures/palette"

/**
 * Thatch as pixel art: layers of straw bundles, each layer a band of strands (thin strokes, lit at
 * the top), its foot a ragged line of strand ends over the shadow on the layer below.
 */
export function thatchTex(seed = 4, size = 128): PixBuf {
  const b = new PixBuf(size, size)
  b.fill((x, y) => {
    const row = Math.floor(y / 14),
      fv = y / 14 - row
    // strand ends hang to different lengths: the layer's ragged foot
    const end = 0.78 + hash2(x, row, seed + 2) * 0.16
    if (fv > end) return lvl("thatch", 1)
    const strand = hash2(x, row, seed)
    const l = { value: 3 + (strand > 0.75 ? 1 : strand < 0.2 ? -1 : 0) }
    if (fv < 0.18) l.value += 1 // the lit top of the layer
    if (fv > end - 0.12) l.value -= 1 // shading just above the ends
    // a darker, older patch here and there
    if (vnoise({ x: x, y: y, scale: 0.06, seed: seed + 7 }) > 0.7) l.value -= 1
    return lvl("thatch", l.value)
  })
  return b
}
