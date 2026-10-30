import { PixelBuffer as PixBuf } from "#/lib/graphics/pixel-buffer"
import type { Anim } from "#/world/scene/figure/animation"
import { FRAMES } from "#/world/scene/figure/animation"
import type { Look, Item } from "#/world/scene/figure/look"
import { FW, FH } from "#/world/scene/figure/render"
import { renderFrame } from "#/world/scene/figure/render-frame"

type Props = {
  L: Look
  anim: Anim
  item: Item
  view: number
}

/** One direction of one animation: frames laid out left to right. */
export function buildSheetStrip(props: Props): PixBuf {
  const n = FRAMES[props.anim]
  const buf = new PixBuf(n * FW, FH)
  for (const f = { value: 0 }; f.value < n; f.value++) renderFrame({ L: props.L, anim: props.anim, f: f.value, view: props.view, item: props.item, out: buf, ox: f.value * FW, oy: 0 })
  return buf
}
