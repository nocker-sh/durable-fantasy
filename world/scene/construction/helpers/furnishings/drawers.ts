import type { Wood } from "#/world/scene/construction/furnishings"
import { cloth, brass } from "#/world/scene/construction/furnishings"
import { Kit } from "#/world/scene/construction/kit"
import { r } from "#/world/scene/construction/helpers/furnishings/r"
import { candleOn } from "#/world/scene/construction/helpers/furnishings/candle-on"

type Props = {
  k: Kit
  wd: Wood
  seed: number
  rows?: number
}

export function drawers(props: Props) {
  const rows = props.rows === undefined ? 4 : props.rows

  const WSource = props.k,
    W = WSource.W,
    D = WSource.D
  const h = rows * 0.22 + 0.1
  props.k.box({ side: props.wd.body, top: null, u0: -W / 2, y0: 0.06, v0: -D / 2, u1: W / 2, y1: h, v1: D / 2 })
  props.k.box({ side: props.wd.dark, top: null, u0: -W / 2 + 0.03, y0: 0, v0: -D / 2 + 0.03, u1: W / 2 - 0.03, y1: 0.06, v1: D / 2 - 0.03 })
  props.k.box({ side: props.wd.top, top: props.wd.top, u0: -W / 2 - 0.02, y0: h, v0: -D / 2 - 0.02, u1: W / 2 + 0.02, y1: h + 0.04, v1: D / 2 + 0.02 })
  for (const i = { value: 0 }; i.value < rows; i.value++) {
    const y = 0.1 + i.value * 0.22
    for (const half of W > 0.9 && i.value === rows - 1 ? [-1, 1] : [0]) {
      const u0 = half === 0 ? -W / 2 + 0.04 : half < 0 ? -W / 2 + 0.04 : 0.01,
        u1 = half === 0 ? W / 2 - 0.04 : half < 0 ? -0.01 : W / 2 - 0.04
      props.k.box({ side: props.wd.trim ?? props.wd.dark, top: null, u0: u0, y0: y, v0: D / 2, u1: u1, y1: y + 0.19, v1: D / 2 + 0.015 })
      props.k.box({ side: brass, top: null, u0: (u0 + u1) / 2 - 0.03, y0: y + 0.08, v0: D / 2 + 0.015, u1: (u0 + u1) / 2 + 0.03, y1: y + 0.11, v1: D / 2 + 0.03 })
    }
  }
  // what is set out on top: a candle, a little box, a folded cloth
  candleOn({ k: props.k, u: -W / 2 + 0.15, v: 0, y: h + 0.04 })
  props.k.box({ side: props.wd.dark, top: brass, u0: 0.0, y0: h + 0.04, v0: -0.08, u1: 0.16, y1: h + 0.12, v1: 0.06 })
  if (r(props.seed, 4) > 0.4) props.k.box({ side: cloth[Math.floor(r(props.seed, 5) * cloth.length)], top: null, u0: W / 2 - 0.3, y0: h + 0.04, v0: -0.1, u1: W / 2 - 0.08, y1: h + 0.07, v1: 0.12 })
}
