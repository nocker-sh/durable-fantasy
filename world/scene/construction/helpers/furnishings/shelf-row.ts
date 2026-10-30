import { createColorMaterial as colorMat } from "#/lib/graphics/create-color-material"
import { M } from "#/world/scene/construction/materials"

import { glass, clay, glaze, crust } from "#/world/scene/construction/furnishings"
import { Kit } from "#/world/scene/construction/kit"
import { r } from "#/world/scene/construction/helpers/furnishings/r"
import { row } from "#/world/scene/construction/helpers/furnishings/row"
import type { Stock } from "#/world/scene/construction/furnishings"

type Props = {
  k: Kit
  y: number
  u0: number
  u1: number
  v: number
  kind: Stock | "rope" | "candles"
  seed: number
}

export function shelfRow(props: Props) {
  row({
    k: props.k,
    y: props.y,
    from: props.u0,
    to: props.u1,
    put: (u, j) => {
      const n = r(props.seed, j)
      if (props.kind === "bread") {
        if (n < 0.5) {
          const c = crust[j % 3]
          props.k.cyl({ side: c, top: c, u: u + 0.09, v: props.v, y0: props.y, y1: props.y + 0.09, r0: 0.09, r1: 0.07, seg: 8 })
          return 0.2
        }
        props.k.box({ side: crust[(j + 1) % 3], top: crust[2], u0: u, y0: props.y, v0: props.v - 0.07, u1: u + 0.26, y1: props.y + 0.1, v1: props.v + 0.07 })
        return 0.3
      }
      if (props.kind === "jars") {
        const g = n < 0.4 ? clay : glaze[j % glaze.length]
        const rr = 0.05 + n * 0.04
        props.k.cyl({ side: g, top: g, u: u + rr, v: props.v, y0: props.y, y1: props.y + 0.14 + n * 0.12, r0: rr, r1: rr * 0.75, seg: 7 })
        return rr * 2 + 0.04
      }
      if (props.kind === "bottles") {
        const g = [glass, glaze[0], colorMat(0x3a5a3a), colorMat(0x6a2a2a)][Math.floor(n * 4)]
        props.k.cyl({ side: g, top: null, u: u + 0.04, v: props.v, y0: props.y, y1: props.y + 0.22, r0: 0.04, r1: 0.04, seg: 6 })
        props.k.cyl({ side: g, top: null, u: u + 0.04, v: props.v, y0: props.y + 0.22, y1: props.y + 0.3, r0: 0.015, r1: 0.015, seg: 5 })
        return 0.1
      }
      if (props.kind === "rope") {
        props.k.cyl({ side: M.rope, top: M.rope, u: u + 0.12, v: props.v, y0: props.y, y1: props.y + 0.08, r0: 0.12, r1: 0.12, seg: 8 })
        return 0.28
      }
      if (props.kind === "candles") {
        for (const t = { value: 0 }; t.value < 5; t.value++)
          props.k.box({ side: colorMat(0xe8dcb8), top: null, u0: u + t.value * 0.035, y0: props.y, v0: props.v - 0.04, u1: u + t.value * 0.035 + 0.025, y1: props.y + 0.2, v1: props.v - 0.015 })
        return 0.24
      }
      // stores: a small crate or a tied sack
      if (n < 0.5) {
        props.k.box({ side: M.sack, top: M.sack, u0: u, y0: props.y, v0: props.v - 0.1, u1: u + 0.22, y1: props.y + 0.2, v1: props.v + 0.1 })
        return 0.27
      }
      props.k.box({ side: M.woodV, top: M.wood, u0: u, y0: props.y, v0: props.v - 0.11, u1: u + 0.26, y1: props.y + 0.2, v1: props.v + 0.11 })
      return 0.31
    },
  })
}
