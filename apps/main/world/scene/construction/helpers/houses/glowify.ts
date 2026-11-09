import * as THREE from "three"

import { toTexture as toTex } from "#/lib/graphics/to-texture"
import type { PixelBuffer as PixBuf } from "#/lib/graphics/pixel-buffer"
import { houseGlows, glowMats } from "#/world/scene/construction/registry"
import { glowOwner } from "#/world/scene/construction/houses"

export function glowify(m: THREE.MeshLambertMaterial, glow: PixBuf | null) {
  if (!glow) return m
  m.emissiveMap = toTex(glow, false)
  m.emissive = new THREE.Color(0xffffff)
  m.emissiveIntensity = 0
  if (glowOwner.value) houseGlows.push({ house: glowOwner.value, mat: m })
  else glowMats.push(m)
  return m
}
