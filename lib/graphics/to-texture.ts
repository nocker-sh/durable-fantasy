import * as THREE from "three"
import type { PixelBuffer } from "#/lib/graphics/pixel-buffer"
export function toTexture(b: PixelBuffer, repeat = true): THREE.Texture {
  const t = new THREE.DataTexture(b.data, b.w, b.h, THREE.RGBAFormat)
  t.flipY = true
  t.magFilter = THREE.NearestFilter
  t.minFilter = THREE.NearestMipmapNearestFilter
  t.generateMipmaps = true
  t.colorSpace = THREE.SRGBColorSpace
  if (repeat) t.wrapS = t.wrapT = THREE.RepeatWrapping
  t.needsUpdate = true
  return t
}
