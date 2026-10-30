import { getSpriteStripFilename } from "#/world/scene/get-sprite-strip-filename"

type Props = Readonly<{ directory: string; resident: number; animation: string; view: number; rendererVersion: number; key: string; frame: readonly [number, number]; frames: number }>

/** ファイル名を再利用しても、異なる描画の画像を HTTP キャッシュで混ぜない。 */
export function getSpriteStripUrl(props: Props): string {
  const identity = new URLSearchParams({ renderer: String(props.rendererVersion), look: props.key, frame: props.frame.join("x"), frames: String(props.frames) })
  return `${props.directory}/${getSpriteStripFilename(props.resident, props.animation, props.view)}?${identity}`
}
