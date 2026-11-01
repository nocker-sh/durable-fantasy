import type { PixelBuffer as PixBuf } from "#/lib/graphics/pixel-buffer"
import { hash2 } from "#/lib/engine/hash2"
import { seamlessNoise } from "#/world/scene/textures/seamless-noise"
import { ToneMap } from "#/world/scene/textures/tone-map"
import { downsampleDithered } from "#/lib/graphics/downsample-dithered"
import { TEXEL_PPU } from "#/world/scene/textures/palette"

/**
 * Thatch painted soft: layers of straw, each a band of strands lit at its top and shading into
 * a ragged foot of strand ends over the layer below; older, greyer patches drift across the roof
 * in broad washes. The strands are strokes running down the slope.
 */
export function thatchTex(seed = 4, size = 256): PixBuf {
  const k = size / 128
  const rows = Math.round(size / (14 * k))
  const t = new ToneMap(size, size)
  t.fill((x, y) => {
    const rv = (y * rows) / size
    const row = Math.floor(rv),
      fv = rv - row
    const wash = seamlessNoise({ x: x, y: y, scale: 0.04 / k, seed: seed + 7, w: size, h: size })
    const l = { value: 3.1 + (wash - 0.5) * 1.1 }
    // strand ends hang to different lengths: the layer's ragged foot, in the shade of the layer
    const end = 0.78 + hash2(x >> k, row, seed + 2) * 0.16
    if (fv > end) return { ramp: "thatch", level: l.value - 1.3, region: row * 2 + 1 }
    if (fv < 0.2) l.value += 0.5 // the lit top of the layer
    if (fv > end - 0.14) l.value -= 0.5 // shading just above the ends
    l.value += (hash2(x, row, seed) - 0.5) * 0.5
    // old straw going grey and dark in patches, rotting where the wet sits, moss over the worst of it
    const rot = seamlessNoise({ x: x, y: y, scale: 0.07 / k, seed: seed + 11, w: size, h: size })
    if (rot > 0.74) return { ramp: rot > 0.8 && fv > 0.5 ? "moss" : "mud", level: rot > 0.8 ? 3 : 2.6 + (fv < 0.2 ? 0.5 : 0), region: row * 2 }
    if (rot > 0.64) l.value -= 0.8
    return { ramp: "thatch", level: l.value, region: row * 2 }
  })
  t.strokes({ seed: seed, density: 0.16, along: "y", len: [3, 9], thick: [1, 1], step: 0.5, bleed: 0.05, wrap: true })
  return downsampleDithered(t.paint(0.16), size / (TEXEL_PPU * 4))
}
