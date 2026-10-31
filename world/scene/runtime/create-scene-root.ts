import { Scene } from "three"
import { disposeObjectTree } from "#/lib/graphics/dispose-object-tree"
import { exposeScene } from "#/world/expose-scene"
import type { CleanupStack } from "#/lib/engine/cleanup-stack"

/** 作成途中で失敗した場合も、根へ追加した描画資源を既存の所有順で回収する。 */
export function createSceneRoot(resources: CleanupStack): Scene {
  const scene = new Scene()
  resources.defer(() => disposeObjectTree(scene, (asset) => resources.release(asset)))
  exposeScene(scene)
  return scene
}
