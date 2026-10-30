import { createColorMaterial as colorMat } from "#/lib/graphics/create-color-material"
import { M } from "#/world/scene/construction/materials"
import type { Wood } from "#/world/scene/construction/furnishings"
import { linen, clay, glaze, wax, ash } from "#/world/scene/construction/furnishings"
import { Kit } from "#/world/scene/construction/kit"
import { r } from "#/world/scene/construction/helpers/furnishings/r"

type Props = {
  k: Kit
  wd: Wood
  seed: number
  what: "fish" | "wash" | "lye" | "tan" | "water" | "glaze" | "tea" | "oil" | "wax"
}

export function tub(props: Props) {
  const rr = Math.min(props.k.W, props.k.D) / 2 - 0.03
  if (props.what === "water" || props.what === "glaze" || props.what === "tea" || props.what === "oil") {
    // an earthen jar: wide in the middle, narrow at the mouth, a wooden lid or a cloth tied over
    const h = props.what === "tea" ? 0.35 : props.what === "oil" ? 0.5 : 0.65
    const m = props.what === "glaze" ? glaze[Math.floor(r(props.seed, 1) * 4)] : clay
    props.k.cyl({ side: m, top: null, u: 0, v: 0, y0: 0, y1: h * 0.55, r0: rr * 0.7, r1: rr, seg: 10 })
    props.k.cyl({ side: m, top: null, u: 0, v: 0, y0: h * 0.55, y1: h, r0: rr, r1: rr * 0.55, seg: 10 })
    props.k.cyl({ side: props.what === "tea" ? linen : props.wd.top, top: props.what === "tea" ? linen : props.wd.top, u: 0, v: 0, y0: h, y1: h + 0.03, r0: rr * 0.6, r1: rr * 0.6, seg: 10 })
    if (props.what === "water") props.k.cyl({ side: props.wd.dark, top: null, u: rr * 0.3, v: 0, y0: h + 0.03, y1: h + 0.06, r0: 0.06, r1: 0.06 }) // a dipper
    return
  }
  if (props.what === "wax") {
    // the chandler's pot on a little stove, wax in it, candles dipped and hung to dry on a rod above
    props.k.box({ side: M.stoneDark, top: M.stone, u0: -rr, y0: 0, v0: -rr, u1: rr, y1: 0.45, v1: rr })
    props.k.box({ side: colorMat(0xff8a3a), top: null, u0: -0.12, y0: 0.08, v0: rr, u1: 0.12, y1: 0.25, v1: rr + 0.005 })
    props.k.cyl({ side: M.iron, top: wax, u: 0, v: 0, y0: 0.45, y1: 0.75, r0: rr * 0.7, r1: rr * 0.75, seg: 10 })
    props.k.box({ side: props.wd.dark, top: null, u0: -rr, y0: 1.35, v0: -0.02, u1: rr, y1: 1.39, v1: 0.02 })
    for (const t = { value: 0 }; t.value < 6; t.value++) props.k.cyl({ side: wax, top: null, u: -rr + 0.12 + t.value * ((rr * 2 - 0.24) / 5), v: 0, y0: 1.0, y1: 1.35, r0: 0.015, r1: 0.012, seg: 5 })
    return
  }
  const h = props.what === "tan" ? 0.8 : props.what === "fish" ? 0.45 : 0.55
  props.k.cyl({ side: props.wd.body, top: null, u: 0, v: 0, y0: 0, y1: h, r0: rr * 0.9, r1: rr, seg: 12 })
  for (const t of [0.2, 0.8]) props.k.cyl({ side: M.iron, top: null, u: 0, v: 0, y0: h * t - 0.02, y1: h * t + 0.02, r0: rr + 0.01, r1: rr + 0.01, seg: 12 })
  const liquid = props.what === "fish" ? M.water : props.what === "wash" ? colorMat(0x9aa8b0) : props.what === "lye" ? colorMat(0x6a6058) : colorMat(0x5a3a28)
  props.k.cyl({ side: liquid, top: liquid, u: 0, v: 0, y0: h - 0.12, y1: h - 0.06, r0: rr - 0.03, r1: rr - 0.03, seg: 12 })
  if (props.what === "wash") props.k.box({ side: props.wd.top, top: null, u0: rr * 0.2, y0: h - 0.2, v0: -0.15, u1: rr * 0.3, y1: h + 0.25, v1: 0.15 }) // the washboard leaned in it
  if (props.what === "fish")
    for (const t = { value: 0 }; t.value < 3; t.value++)
      props.k.box({ side: colorMat(0x8a9aa8), top: null, u0: -0.12 + t.value * 0.08, y0: h - 0.07, v0: -0.04, u1: -0.06 + t.value * 0.08, y1: h - 0.05, v1: 0.12 })
  if (props.what === "tan") props.k.box({ side: colorMat(0x6a4632), top: null, u0: -rr * 0.6, y0: h - 0.06, v0: -0.05, u1: rr * 0.9, y1: h + 0.02, v1: 0.15 }) // a hide over the rim
  if (props.what === "lye") props.k.cyl({ side: ash, top: null, u: rr * 1.1, v: rr * 0.4, y0: 0, y1: 0.12, r0: 0.12, r1: 0.08 }) // the ash it is made from
}
