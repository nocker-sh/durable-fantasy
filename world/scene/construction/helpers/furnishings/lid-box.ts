import { createColorMaterial as colorMat } from "#/lib/graphics/create-color-material"
import { M } from "#/world/scene/construction/materials"
import type { Wood } from "#/world/scene/construction/furnishings"
import { Kit } from "#/world/scene/construction/kit"
import { r } from "#/world/scene/construction/helpers/furnishings/r"
import { crateTop } from "#/world/scene/construction/helpers/furnishings/crate-top"

type Props = {
  k: Kit
  wd: Wood
  seed: number
  kind: "materials" | "flour" | "tinker" | "crate"
}

export function lidBox(props: Props) {
  const WSource = props.k,
    W = WSource.W,
    D = WSource.D
  const h = props.kind === "flour" ? 0.75 : props.kind === "tinker" ? 0.4 : 0.55
  props.k.box({ side: props.wd.body, top: null, u0: -W / 2, y0: 0, v0: -D / 2, u1: W / 2, y1: h, v1: D / 2 })
  for (const t of [0.15, 0.85]) props.k.box({ side: props.wd.dark, top: null, u0: -W / 2 - 0.01, y0: h * t - 0.025, v0: -D / 2 - 0.01, u1: W / 2 + 0.01, y1: h * t + 0.025, v1: D / 2 + 0.01 })
  if (props.kind === "flour") {
    // a bin with a sloped lid, propped open, flour inside
    props.k.box({ side: colorMat(0xe8e0d0), top: null, u0: -W / 2 + 0.04, y0: h - 0.1, v0: -D / 2 + 0.04, u1: W / 2 - 0.04, y1: h - 0.02, v1: D / 2 - 0.04 })
    props.k.box({ side: props.wd.top, top: props.wd.top, u0: -W / 2, y0: h, v0: -D / 2 - 0.02, u1: W / 2, y1: h + 0.35, v1: -D / 2 + 0.03 })
    props.k.cyl({ side: props.wd.dark, top: null, u: W / 2 - 0.15, v: 0, y0: h - 0.02, y1: h + 0.02, r0: 0.06, r1: 0.06 }) // a scoop
  } else if (props.kind === "materials") {
    // half open: what is in it shows (cut leather, ingots, twigs)
    props.k.box({ side: props.wd.top, top: props.wd.top, u0: -W / 2, y0: h, v0: -D / 2, u1: W / 2, y1: h + 0.04, v1: 0 })
    props.k.box({ side: M.iron, top: null, u0: -W * 0.3, y0: h - 0.05, v0: 0.05, u1: -W * 0.05, y1: h + 0.02, v1: D / 2 - 0.06 })
    props.k.box({ side: colorMat(0x6a4632), top: null, u0: 0, y0: h - 0.05, v0: 0.05, u1: W * 0.35, y1: h + 0.03, v1: D / 2 - 0.05 })
  } else if (props.kind === "tinker") {
    // a tinker's box, its tray lifted out: files, a soldering iron, little pots
    props.k.box({ side: props.wd.top, top: props.wd.top, u0: -W / 2, y0: h, v0: -D / 2, u1: W / 2, y1: h + 0.03, v1: D / 2 })
    props.k.box({ side: props.wd.dark, top: null, u0: -0.03, y0: h + 0.03, v0: -D / 2, u1: 0.03, y1: h + 0.2, v1: D / 2 })
    props.k.box({ side: props.wd.dark, top: null, u0: -0.15, y0: h + 0.17, v0: -0.02, u1: 0.15, y1: h + 0.2, v1: 0.02 }) // the handle
    for (const t = { value: 0 }; t.value < 3; t.value++)
      props.k.box({ side: M.iron, top: null, u0: W * 0.15 + t.value * 0.06, y0: h + 0.03, v0: -D * 0.3, u1: W * 0.15 + t.value * 0.06 + 0.02, y1: h + 0.05, v1: D * 0.3 })
  } else {
    props.k.box({ side: props.wd.top, top: props.wd.top, u0: -W / 2, y0: h, v0: -D / 2, u1: W / 2, y1: h + 0.03, v1: D / 2 })
    if (r(props.seed, 2) > 0.5) crateTop(props.k, h + 0.03)
  }
}
