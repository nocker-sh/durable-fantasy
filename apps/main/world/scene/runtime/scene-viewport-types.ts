import type { WebGLRenderer } from "three"
import type { DioramaPostProcessing } from "#/lib/graphics/post-processing"

export type SceneViewport = Readonly<{
  renderer: Pick<WebGLRenderer, "setPixelRatio" | "setSize"> & { domElement: { style: Pick<CSSStyleDeclaration, "width" | "height"> } }
  post: Pick<DioramaPostProcessing, "resize">
}>
