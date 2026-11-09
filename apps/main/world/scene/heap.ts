import { Rng } from "#/lib/engine/random"
import { PixelBuffer as PixBuf } from "#/lib/graphics/pixel-buffer"
import { item } from "#/world/scene/helpers/goods/item"

/** Heap of items for a crate or basket, w x h px canvas. */
type Props = {
  kind: string
  w: number
  h: number
  seed: number
}

export function heap(props: Props): PixBuf {
  const b = new PixBuf(props.w, props.h)
  const rng = new Rng(props.seed)
  const sz = props.kind === "cabbage" ? 10 : props.kind === "bread" ? 13 : props.kind === "cheese" ? 16 : props.kind === "fish" ? 18 : props.kind === "jug" ? 11 : 6
  const rows = Math.max(1, Math.floor((props.h - 4) / (sz * 0.72)))
  for (const r = { value: rows - 1 }; r.value >= 0; r.value--) {
    const yc = props.h - 3 - r.value * sz * 0.72 - sz / 2
    const span = (props.w - sz) * (1 - r.value / (rows + 0.6))
    const n = Math.max(1, Math.round(span / (sz * 0.86)) + 1)
    for (const i = { value: 0 }; i.value < n; i.value++) {
      const xc = props.w / 2 - span / 2 + (n === 1 ? span / 2 : (i.value / (n - 1)) * span) + (rng.next() - 0.5) * 1.6
      item({ b: b, kind: props.kind, cx: xc, cy: yc + (rng.next() - 0.5) * 1.6, rng: rng })
    }
  }
  return b
}
