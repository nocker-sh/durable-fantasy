import type * as THREE from "three"
import type { PixelBuffer } from "#/lib/graphics/pixel-buffer"
import { toTexture } from "#/lib/graphics/to-texture"
import { downsampleDithered } from "#/lib/graphics/downsample-dithered"
import { TEXEL_PPU } from "#/world/scene/textures/palette"

/**
 * A picture drawn at `ppu` pixels to a unit (goods, decals, laundry: `goods.ts` GPPU), shrunk to the
 * one dot size of the world before it becomes a texture, so it shows no finer dots than the ground.
 * The size it is shown at in the world is still worked out from the picture as drawn.
 */
export function dotTexture(b: PixelBuffer, ppu: number, repeat = false): THREE.Texture {
  const f = Math.round(ppu / TEXEL_PPU)
  return toTexture(f >= 2 ? downsampleDithered(b, f) : b, repeat)
}
