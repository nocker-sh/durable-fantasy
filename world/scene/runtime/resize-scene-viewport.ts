import type { SceneViewport } from "#/world/scene/runtime/scene-viewport-types"

type Props = SceneViewport & Readonly<{ width: number; height: number; scale: number }>

/** 描画面と後処理は同じ整数の画素数にそろえ、表示上の寸法は元の大きさを保つ。 */
export function resizeSceneViewport(props: Props): void {
  const width = Math.ceil(props.width / props.scale)
  const height = Math.ceil(props.height / props.scale)
  props.renderer.setPixelRatio(1)
  props.renderer.setSize(width, height, false)
  props.post.resize(width, height)
  props.renderer.domElement.style.width = props.width + "px"
  props.renderer.domElement.style.height = props.height + "px"
}
