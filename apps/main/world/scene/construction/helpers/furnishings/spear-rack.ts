import { createColorMaterial as colorMat } from "#/lib/graphics/create-color-material"
import { M } from "#/world/scene/construction/materials"
import type { Wood } from "#/world/scene/construction/furnishings"
import { Kit } from "#/world/scene/construction/kit"
import { r } from "#/world/scene/construction/helpers/furnishings/r"

type Props = {
  k: Kit
  wd: Wood
  seed: number
  old?: boolean
}

export function spearRack(props: Props) {
  const old = props.old === undefined ? false : props.old

  const WSource = props.k,
    W = WSource.W
  props.k.box({ side: props.wd.dark, top: props.wd.top, u0: -W / 2, y0: 0, v0: -0.12, u1: W / 2, y1: 0.12, v1: 0.12 })
  props.k.box({ side: props.wd.dark, top: null, u0: -W / 2, y0: 1.0, v0: -0.04, u1: W / 2, y1: 1.05, v1: 0.04 })
  for (const su of [-1, 1]) props.k.box({ side: props.wd.dark, top: null, u0: su * (W / 2 - 0.03) - 0.03, y0: 0, v0: -0.03, u1: su * (W / 2 - 0.03) + 0.03, y1: 1.05, v1: 0.03 })
  const n = Math.max(2, Math.floor(W / 0.14))
  for (const t = { value: 0 }; t.value < n; t.value++) {
    const u = -W / 2 + 0.1 + t.value * ((W - 0.2) / (n - 1))
    const h = 1.7 + r(props.seed, t.value) * 0.2
    props.k.box({ side: M.woodV, top: null, u0: u - 0.015, y0: 0.1, v0: -0.015, u1: u + 0.015, y1: h, v1: 0.015 })
    props.k.box({ side: old ? colorMat(0x6a4a3a) : M.iron, top: null, u0: u - 0.025, y0: h, v0: -0.01, u1: u + 0.025, y1: h + 0.16, v1: 0.01 })
  }
}
