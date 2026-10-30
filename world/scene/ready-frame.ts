import type { Anim } from "#/world/scene/figure/animation"
import type { Item, Look } from "#/world/scene/figure/look"
import { lookKey } from "#/world/scene/sprite-key"
import { decoded } from "#/world/scene/sprite-pool"

/** The frame if it has been drawn, without asking for it. */
type Props = {
  look: Look
  item: Item
  anim: Anim
  view: number
  f: number
  id?: string
}

export function readyFrame(props: Props): ImageBitmap | null {
  const id = props.id === undefined ? lookKey(props.look, props.item) : props.id

  return decoded.get(`frame:${id}|${props.anim}|${props.view}|${props.f}`) ?? null
}
