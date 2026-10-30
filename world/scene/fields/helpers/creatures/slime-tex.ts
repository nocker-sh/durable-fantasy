import * as THREE from "three"
const slimeTexCache = new Map<number, THREE.Texture>()

import { toTexture as toTex } from "#/lib/graphics/to-texture"
import { PixelBuffer as PixBuf } from "#/lib/graphics/pixel-buffer"
import { hash2 } from "#/lib/engine/hash2"
import { SLIME_W, SLIME_H } from "#/world/scene/fields/creatures"

export function slimeTex(color: number): THREE.Texture {
  const hit = slimeTexCache.get(color)
  if (hit) return hit
  const base: [number, number, number] = [(color >> 16) & 255, (color >> 8) & 255, color & 255]
  const mix = (k: number, to: number): [number, number, number] => base.map((c) => Math.round(c + (to - c) * k)) as [number, number, number]
  // tones: rim shadow, shade, body, lit, gleam
  const tone = [mix(0.55, 20), mix(0.28, 30), base, mix(0.28, 255), mix(0.88, 255)]
  const eye: [number, number, number] = [30, 22, 38],
    white: [number, number, number] = [250, 250, 244]
  const b = new PixBuf(SLIME_W, SLIME_H)
  const front = SLIME_W / 4
  b.fill((x, y) => {
    // shading by height on the dome, a band of dither between tones
    const k = y / (SLIME_H - 1)
    const t = { value: k < 0.3 ? 3 : k < 0.72 ? 2 : k < 0.9 ? 1 : 0 }
    if (k > 0.25 && k < 0.35) t.value = (x + y) % 2 ? 3 : 2
    if (k > 0.67 && k < 0.77) t.value = (x + y) % 2 ? 2 : 1
    // bubbles: a few lighter dots, fixed in the gel
    if (hash2(x, y, 7) > 0.95 && y > 3 && y < 12) t.value = Math.min(4, t.value + 1)
    const dx = x - front
    // the gleam, up and to the left of the face
    if ((y === 3 && dx >= -7 && dx <= -4) || (y === 4 && dx >= -8 && dx <= -6) || (y === 5 && dx === -8)) t.value = 4
    if (y === 3 && dx === -3) t.value = 3
    // eyes: two pixels wide, three tall, a catchlight at the top
    for (const ex of [-4, 3]) if (dx >= ex && dx <= ex + 1 && y >= 6 && y <= 8) return y === 6 && dx === ex ? white : eye
    return tone[Math.max(0, Math.min(4, t.value))]
  })
  const tex = toTex(b, false)
  tex.wrapS = THREE.RepeatWrapping
  tex.minFilter = THREE.NearestFilter
  tex.generateMipmaps = false
  slimeTexCache.set(color, tex)
  return tex
}
