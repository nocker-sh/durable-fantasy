import { WebGLRenderer, BasicShadowMap, SRGBColorSpace } from "three"
import type { CleanupStack } from "#/lib/engine/cleanup-stack"

/** The renderer of the map last left, kept so the next map draws in the same WebGL context. */
const spare: { value: WebGLRenderer | null } = { value: null }

/**
 * 描画器はマップをまたいで使い回す。作り直すと文脈の破棄(約1秒)とシェーダーの再コンパイルが毎回かかる。
 * マップの資源は各自の dispose で返し、文脈は二つ目の描画器が要る時と失われた時だけ捨てる。
 */
export function createSceneRenderer(resources: CleanupStack): WebGLRenderer {
  const reused = spare.value
  spare.value = null
  const renderer = reused && !reused.getContext().isContextLost() ? reused : freshRenderer(reused)
  resources.defer(() => returnRenderer(renderer))
  return renderer
}

function freshRenderer(lost: WebGLRenderer | null): WebGLRenderer {
  if (lost) discard(lost)
  const renderer = new WebGLRenderer({ antialias: false })
  renderer.shadowMap.enabled = true
  renderer.shadowMap.type = BasicShadowMap
  renderer.shadowMap.autoUpdate = false
  renderer.outputColorSpace = SRGBColorSpace
  Object.assign(renderer.domElement.style, { display: "block", imageRendering: "pixelated", touchAction: "none", cursor: "default" })
  return renderer
}

function returnRenderer(renderer: WebGLRenderer): void {
  if (spare.value || renderer.getContext().isContextLost()) {
    discard(renderer)
    return
  }
  try {
    renderer.setRenderTarget(null)
    renderer.renderLists.dispose()
    renderer.domElement.style.cursor = "default"
  } catch (error) {
    discard(renderer)
    throw error
  }
  spare.value = renderer
}

/** 描画器の解放に失敗しても WebGL の文脈は返す。 */
function discard(renderer: WebGLRenderer): void {
  try {
    renderer.dispose()
  } finally {
    renderer.forceContextLoss()
  }
}
