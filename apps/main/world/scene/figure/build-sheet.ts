import { PixelBuffer as PixBuf } from "#/lib/graphics/pixel-buffer"
import type { Anim } from "#/world/scene/figure/animation"
import { FRAMES } from "#/world/scene/figure/animation"
import type { Look, Item } from "#/world/scene/figure/look"
import { FW, FH } from "#/world/scene/figure/render"
import { renderFrame } from "#/world/scene/figure/render-frame"
import type { Sheet } from "#/world/scene/figure/sheets"

type Props = {
  L: Look
  anims: Anim[]
  items: Partial<Record<Anim, Item>>
  defItem: Item
}

/** Render all views of the given animations into one atlas: row = anim*8 + view, column = frame. */
export function buildSheet(props: Props): Sheet {
  const cols = Math.max(...props.anims.map((a) => FRAMES[a]))
  const buf = new PixBuf(cols * FW, props.anims.length * 8 * FH)
  const rows: Record<string, number> = {}
  props.anims.forEach((a, ai) => {
    rows[a] = ai * 8
    for (const v = { value: 0 }; v.value < 8; v.value++)
      for (const f = { value: 0 }; f.value < FRAMES[a]; f.value++) {
        const it = a in props.items ? props.items[a]! : props.defItem
        renderFrame({ L: props.L, anim: a, f: f.value, view: v.value, item: it, out: buf, ox: f.value * FW, oy: (ai * 8 + v.value) * FH })
      }
  })
  return { buf, cols, rows, anims: props.anims }
}
