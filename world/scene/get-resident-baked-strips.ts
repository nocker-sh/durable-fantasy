import { FW, FH } from "#/world/scene/figure/render"
import { FRAMES } from "#/world/scene/figure/animation"
import { lookKey } from "./sprite-key"
import { getSpriteStripUrl } from "./get-sprite-strip-url"
import { SPRITE_RENDER_VERSION } from "./sprite-render-version"
import type { Item, Look } from "./figure/look"
import type { BakedStrips } from "#/world/scene/actors"
import type { SpriteManifest } from "./sprite-manifest-types"

type Props = Readonly<{ directory: string; index: number; name: string; look: Look; item: Item; manifest: SpriteManifest | null }>

/** 適合する事前生成だけを使い、HTTP の画像も同じ描画の識別情報へ結び付ける。 */
export function getResidentBakedStrips(props: Props): BakedStrips | null {
  const entry = props.manifest?.frame[0] === FW && props.manifest.frame[1] === FH ? props.manifest.residents[props.index] : null
  if (!entry || entry.name !== props.name || entry.key !== lookKey(props.look, props.item)) return null
  const identity = { directory: props.directory, resident: props.index, rendererVersion: SPRITE_RENDER_VERSION, key: entry.key, frame: [FW, FH] satisfies [number, number] }
  return { item: props.item, url: (animation, view) => (entry.anims[animation] === FRAMES[animation] ? getSpriteStripUrl({ ...identity, animation, view, frames: entry.anims[animation] }) : null) }
}
