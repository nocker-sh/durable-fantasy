import { RAMPS } from "#/world/scene/pix"
import { PixelBuffer as PixBuf } from "#/lib/graphics/pixel-buffer"
import { shade } from "#/world/scene/helpers/goods/shade"
import { heap } from "#/world/scene/heap"

/** Wicker basket with goods heaped on top. */
type Props = {
  kind: string
  seed: number
  w?: number
  h?: number
}

export function basket(props: Props): PixBuf {
  const w = props.w === undefined ? 30 : props.w
  const h = props.h === undefined ? 26 : props.h

  const b = new PixBuf(w, h)
  const top = heap({ kind: props.kind, w: w - 4, h: h - 8, seed: props.seed })
  b.blit({ source: top, x: 2, y: 0 })
  const W = RAMPS.thatch
  for (const y = { value: h - 12 }; y.value < h; y.value++)
    for (const x = { value: 1 }; x.value < w - 1; x.value++) {
      const t = (y.value - (h - 12)) / 12
      const inset = Math.round(t * 2.5)
      if (x.value < 1 + inset || x.value >= w - 1 - inset) continue
      const weave = (x.value + (y.value >> 1)) % 4 < 2 !== (((y.value >> 1) & 1) === 0)
      const l = { value: 0.62 - ((x.value - w / 2) / w) * 0.5 + (weave ? 0.12 : -0.08) - t * 0.15 }
      if (y.value === h - 12 || y.value === h - 11) l.value = 0.8
      if (y.value === h - 1) l.value = 0.1
      b.set({ x: x.value, y: y.value, color: shade({ ramp: W, l: l.value, x: x.value, y: y.value }) })
    }
  return b
}
