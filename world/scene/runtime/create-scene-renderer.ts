import { WebGLRenderer, BasicShadowMap, SRGBColorSpace } from "three"
import type { CleanupStack } from "#/lib/engine/cleanup-stack"

/** 描画器の解放後に WebGL の所有を返し、影の更新は既存のフレーム処理へ任せる。 */
export function createSceneRenderer(resources: CleanupStack): WebGLRenderer {
  const renderer = new WebGLRenderer({ antialias: false })
  resources.defer(() => renderer.forceContextLoss())
  resources.use(renderer)
  renderer.shadowMap.enabled = true
  renderer.shadowMap.type = BasicShadowMap
  renderer.shadowMap.autoUpdate = false
  renderer.outputColorSpace = SRGBColorSpace
  Object.assign(renderer.domElement.style, { display: "block", imageRendering: "pixelated", touchAction: "none" })
  return renderer
}
