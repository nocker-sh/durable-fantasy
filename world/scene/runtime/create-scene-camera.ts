import { PixelCamera } from "#/lib/graphics/pixel-camera"
import { FIG_PPU } from "#/world/scene/figure/display-scale"
import { resizeSceneViewport } from "#/world/scene/runtime/resize-scene-viewport"
import type { Vector3 } from "three"
import type { SceneViewport } from "#/world/scene/runtime/scene-viewport-types"

type Props = Readonly<{ viewport: SceneViewport; position: Vector3; preview: boolean; zoom?: number }>

/** 通常の追従と開発用の見渡しの倍率を保ち、画素数の変更を描画面と後処理へ渡す。 */
export function createSceneCamera(props: Props): PixelCamera {
  return new PixelCamera({
    position: props.position,
    pixelsPerUnit: FIG_PPU,
    onResize: (width, height, scale) => resizeSceneViewport({ ...props.viewport, width, height, scale }),
    zooms: props.preview ? [0.5, 1, 2] : undefined,
    level: props.preview ? (props.zoom ?? 1) : 0,
  })
}
