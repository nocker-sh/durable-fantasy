import { BillboardBatch } from "#/lib/graphics/billboards"
import { toTexture } from "#/lib/graphics/to-texture"
import { chimneys } from "#/world/scene/construction/registry"
import { createSmokePixels } from "#/world/scene/runtime/create-smoke-pixels"
import { createSmokePuffs } from "#/world/scene/runtime/create-smoke-puffs"
import type { Scene } from "three"
import type { CleanupStack } from "#/lib/engine/cleanup-stack"

/** 一括描画の幾何と材質を根へ追加する前に所有し、煙突がなくても同じ回収手順を使う。 */
export function createSceneSmoke(scene: Scene, resources: CleanupStack) {
  const texture = resources.use(toTexture(createSmokePixels(), false))
  const smoke = new BillboardBatch(texture, chimneys.length * 7)
  resources.use(smoke.mesh.geometry)
  resources.use(smoke.mesh.material)
  if (smoke.count) scene.add(smoke.mesh)
  return { smoke, puffs: createSmokePuffs(chimneys) }
}
