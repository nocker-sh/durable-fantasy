import { renameSync } from "node:fs"
import { isCompleteSpriteStrip } from "#/scripts/lib/is-complete-sprite-strip"
type Props = Readonly<{ pngPath: string; target: string; token: string; encode: (source: string, destination: string) => void | Promise<void> }>

/** 符号化が完了した自分の一時ファイルだけを、読める名前へ移す。 */
export async function commitSpriteBakeStrip(props: Props): Promise<void> {
  const pending = `${props.target}.${props.token}.pending`
  await props.encode(props.pngPath, pending)
  if (!isCompleteSpriteStrip(pending)) throw new Error("Sprite encoder did not produce a completed strip")
  renameSync(pending, props.target)
}
