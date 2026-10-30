import type { Wood } from "#/world/scene/construction/furnishings"
import { cloth, linen } from "#/world/scene/construction/furnishings"
import { Kit } from "#/world/scene/construction/kit"
import { r } from "#/world/scene/construction/helpers/furnishings/r"

// ---------------------------------------------------------------- beds and seats

type Props = {
  k: Kit
  wd: Wood
  seed: number
  child?: boolean
}

export function bed(props: Props) {
  const child = props.child === undefined ? false : props.child

  const WSource = props.k,
    W = WSource.W,
    D = WSource.D
  const h = child ? 0.32 : 0.4
  props.k.box({ side: props.wd.dark, top: props.wd.top, u0: -W / 2, y0: 0, v0: -D / 2, u1: W / 2, y1: child ? 0.75 : 1.0, v1: -D / 2 + 0.06 }) // headboard
  props.k.box({ side: props.wd.dark, top: props.wd.top, u0: -W / 2, y0: 0, v0: D / 2 - 0.06, u1: W / 2, y1: child ? 0.6 : 0.62, v1: D / 2 }) // footboard
  for (const s of [-1, 1])
    props.k.box({ side: props.wd.body, top: props.wd.top, u0: (s * W) / 2 - 0.04, y0: 0.12, v0: -D / 2, u1: (s * W) / 2 + (s < 0 ? 0.04 : 0) - (s > 0 ? 0 : 0), y1: h, v1: D / 2 })
  if (props.wd.trim) props.k.box({ side: props.wd.trim, top: null, u0: -W * 0.25, y0: 0.7, v0: -D / 2 + 0.061, u1: W * 0.25, y1: 0.85, v1: -D / 2 + 0.065 })
  props.k.box({ side: linen, top: linen, u0: -W / 2 + 0.05, y0: h, v0: -D / 2 + 0.06, u1: W / 2 - 0.05, y1: h + 0.12, v1: D / 2 - 0.06 }) // mattress
  // a pillow at the head, a quilt over the rest, turned back at the top
  const pw = W > 1.2 ? W / 2 - 0.1 : W - 0.2
  for (const pu of W > 1.2 ? [-W / 4, W / 4] : [0]) props.k.box({ side: linen, top: linen, u0: pu - pw / 2, y0: h + 0.12, v0: -D / 2 + 0.1, u1: pu + pw / 2, y1: h + 0.22, v1: -D / 2 + 0.4 })
  const q = cloth[Math.floor(r(props.seed, 1) * cloth.length)]
  props.k.box({ side: q, top: q, u0: -W / 2 + 0.03, y0: h + 0.1, v0: -D / 2 + 0.5, u1: W / 2 - 0.03, y1: h + 0.17, v1: D / 2 - 0.08 })
  props.k.box({ side: q, top: null, u0: -W / 2 + 0.02, y0: h - 0.12, v0: -D / 2 + 0.5, u1: -W / 2 + 0.03, y1: h + 0.17, v1: D / 2 - 0.08 }) // hanging over the sides
  props.k.box({ side: q, top: null, u0: W / 2 - 0.03, y0: h - 0.12, v0: -D / 2 + 0.5, u1: W / 2 - 0.02, y1: h + 0.17, v1: D / 2 - 0.08 })
  if (child)
    for (const s of [-1, 1])
      for (const t = { value: 0 }; t.value < 5; t.value++)
        props.k.box({
          side: props.wd.dark,
          top: null,
          u0: (s * W) / 2 - 0.02,
          y0: h,
          v0: -D / 2 + 0.3 + t.value * ((D - 0.6) / 4) - 0.02,
          u1: (s * W) / 2 + 0.02,
          y1: h + 0.3,
          v1: -D / 2 + 0.3 + t.value * ((D - 0.6) / 4) + 0.02,
        })
}
