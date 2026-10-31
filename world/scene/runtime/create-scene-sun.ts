import { DirectionalLight } from "three"
import { N } from "#/world/scene/world"
import type { CleanupStack } from "#/lib/engine/cleanup-stack"

/** 影を設定する前に所有し、町の中心を照らす範囲と解像度を保つ。 */
export function createSceneSun(resources: CleanupStack): DirectionalLight {
  const sun = new DirectionalLight(0xffe0b0, 2.4)
  resources.use(sun.shadow)
  sun.castShadow = true
  sun.shadow.mapSize.set(2048, 2048)
  const camera = sun.shadow.camera
  camera.left = -34
  camera.right = 34
  camera.top = 34
  camera.bottom = -34
  camera.near = 1
  camera.far = 120
  sun.shadow.bias = -0.0008
  sun.target.position.set(N / 2, 0, N / 2)
  return sun
}
