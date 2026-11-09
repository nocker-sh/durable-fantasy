import { PixelCamera } from "#/lib/graphics/pixel-camera"
import { FIG_PPU, FIG_DOT } from "#/world/scene/figure/display-scale"
import { CAMERA_PITCH } from "#/world/scene/camera-pitch"
import { resizeSceneViewport } from "#/world/scene/runtime/resize-scene-viewport"
import type { Vector3 } from "three"
import type { SceneViewport } from "#/world/scene/runtime/scene-viewport-types"

type Props = Readonly<{ viewport: SceneViewport; position: Vector3; preview: boolean; zoom?: number }>

/**
 * 通常の追従と開発用の見渡しの倍率を保ち、画素数の変更を描画面と後処理へ渡す。
 * 画面は世界のドット(地面と同じ、人は FIG_DOT で縮めた大きさ)で描き、整数倍に拡大して見せる。
 */
export function createSceneCamera(props: Props): PixelCamera {
  return new PixelCamera({
    position: props.position,
    pitch: CAMERA_PITCH,
    pixelsPerUnit: FIG_PPU / FIG_DOT,
    onResize: (width, height, scale) => resizeSceneViewport({ ...props.viewport, width, height, scale }),
    zooms: (props.preview ? [0.5, 1, 2] : [1, 2, 3, 4]).map((zoom) => zoom * FIG_DOT),
    level: props.preview ? (props.zoom ?? 1) : 0,
  })
}
