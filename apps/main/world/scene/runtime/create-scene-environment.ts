import { HemisphereLight } from "three"
import { createSceneSun } from "#/world/scene/runtime/create-scene-sun"
import { createSceneSmoke } from "#/world/scene/runtime/create-scene-smoke"
import type { Scene } from "three"
import type { CleanupStack } from "#/lib/engine/cleanup-stack"

/** 環境光・太陽と影・煙を建物の後に組み立て、同じ取得順と根の描画順を保つ。 */
export function createSceneEnvironment(scene: Scene, resources: CleanupStack) {
  const hemi = new HemisphereLight(0xfff0d8, 0x48405a, 1.4)
  scene.add(hemi)
  const sun = createSceneSun(resources)
  scene.add(sun, sun.target)
  const smoke = createSceneSmoke(scene, resources)
  return { hemi, sun, puffs: smoke.puffs, smoke: smoke.smoke }
}
