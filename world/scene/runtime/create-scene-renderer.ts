import { WebGLRenderer, BasicShadowMap, SRGBColorSpace } from "three"
import type { CleanupStack } from "#/lib/engine/cleanup-stack"

/** At most this many shader programs outlive the map that compiled them. */
const KEPT_PROGRAMS = 256

/** The renderer of the map last left, kept so the next map draws in the same WebGL context. */
const spare: { value: WebGLRenderer | null } = { value: null }
const kept = new WeakSet<object>()
const keptCount = new WeakMap<WebGLRenderer, number>()

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

/** Keep the compiled shader programs of a map being left, so materials alike on the next map link at once. */
export function keepPrograms(renderer: WebGLRenderer): void {
  let count = keptCount.get(renderer) ?? 0
  for (const program of renderer.info.programs ?? []) {
    if (count >= KEPT_PROGRAMS) break
    if (kept.has(program)) continue
    kept.add(program)
    count++
    // three.js destroys a program when its last material lets go; one extra use keeps it cached
    program.usedTimes++
  }
  keptCount.set(renderer, count)
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
