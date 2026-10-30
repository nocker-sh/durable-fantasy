import * as THREE from "three"
import type { PixelBuffer as PixBuf } from "#/lib/graphics/pixel-buffer"
import { toTexture as toTex } from "#/lib/graphics/to-texture"

/**
 * Sprites are not lit by the scene's lights, so every pixel sprite (crops, goods, clutter) is
 * listed here and takes the time of day's tint (index.ts), darkening at night like everything
 * else. Only what really gives light may stay bright.
 */
export const litSprites: THREE.SpriteMaterial[] = []

/** Camera-facing pixel sprite whose bottom centre sits at the given point. ppu = texels per world unit. */
export function pixSprite(b: PixBuf, ppu: number): THREE.Sprite {
  const m = new THREE.SpriteMaterial({ map: toTex(b, false), alphaTest: 0.5 })
  litSprites.push(m)
  const s = new THREE.Sprite(m)
  s.center.set(0.5, 0)
  s.scale.set(b.w / ppu, b.h / ppu, 1)
  return s
}
