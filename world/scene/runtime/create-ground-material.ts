import { MeshLambertMaterial, NearestFilter } from "three"
import { toTexture } from "#/lib/graphics/to-texture"
import { stoneTex } from "#/world/scene/textures/stone-tex"
import { applyGroundShader } from "#/world/scene/runtime/apply-ground-shader"
import type { PixelBuffer } from "#/lib/graphics/pixel-buffer"
import type { CleanupStack } from "#/lib/engine/cleanup-stack"

/** 地面の画素と斜面の石のテクスチャを材質より先に所有し、拡大しても画素をぼかさない。 */
export function createGroundMaterial(ground: PixelBuffer, resources: CleanupStack): MeshLambertMaterial {
  const groundTexture = resources.use(toTexture(ground, false))
  groundTexture.minFilter = NearestFilter
  groundTexture.generateMipmaps = false
  const wall = resources.use(toTexture(stoneTex({ ramp: "stone", light: 0.5, seed: 21, bw: 20, bh: 11, size: 128 })))
  const material = resources.use(new MeshLambertMaterial({ map: groundTexture }))
  material.onBeforeCompile = (shader) => applyGroundShader(shader, wall)
  return material
}
