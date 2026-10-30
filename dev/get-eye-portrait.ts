import { PixelBuffer as PixBuf } from "../lib/graphics/pixel-buffer"
import { FW, FH } from "#/world/scene/figure/render"
import { renderFrame } from "#/world/scene/figure/render-frame"
import type { Look, Item } from "#/world/scene/figure/look"
type Props = { look: Look; item: Item; view: number }
/** This comparison shows only the first standing frame; generating the whole animation needlessly blocks every face. */
export function getEyePortrait(props: Props): PixBuf {
  const frame = new PixBuf(FW, FH)
  renderFrame({ L: props.look, anim: "idle", f: 0, view: props.view, item: props.item, out: frame, ox: 0, oy: 0 })
  const top = Array.from({ length: FH }, (_, y) => y).find((y) => Array.from({ length: FW }, (_, x) => x).some((x) => frame.data[(y * FW + x) * 4 + 3])) ?? FH
  const portrait = new PixBuf(36, 30),
    x0 = Math.round(FW / 2 - 18)
  for (const index of portrait.data.keys()) {
    const y = Math.floor(index / (portrait.w * 4)),
      x = Math.floor(index / 4) % portrait.w,
      channel = index % 4
    portrait.data[index] = frame.data[((y + top - 2) * FW + x + x0) * 4 + channel] ?? 0
  }
  return portrait
}
