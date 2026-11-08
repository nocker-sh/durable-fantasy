import { createColorMaterial as colorMat } from "#/lib/graphics/create-color-material"
import { M } from "#/world/scene/construction/materials"
import type { Wood } from "#/world/scene/construction/furnishings"
import { glass } from "#/world/scene/construction/furnishings"
import { Kit } from "#/world/scene/construction/kit"
import { r } from "#/world/scene/construction/helpers/furnishings/r"

type Props = {
  k: Kit
  wd: Wood
  seed: number
  kind?: "bench" | "joiner" | "mend"
}

export function workbench(props: Props) {
  const kind = props.kind === undefined ? "bench" : props.kind

  const WSource = props.k,
    W = WSource.W,
    D = WSource.D
  props.k.legs({ m: props.wd.dark, h: 0.82, t: 0.09, inset: 0.05 })
  for (const sv of [-1, 1]) props.k.box({ side: props.wd.dark, top: null, u0: -W / 2 + 0.1, y0: 0.15, v0: sv * (D / 2 - 0.1) - 0.03, u1: W / 2 - 0.1, y1: 0.22, v1: sv * (D / 2 - 0.1) + 0.03 })
  props.k.slab({ m: props.wd.body, y: 0.18, t: 0.03, W: W - 0.2, D: D - 0.2 }) // a shelf below
  props.k.slab({ m: props.wd.top, y: 0.82, t: 0.08 })
  // a rack of tools on the back edge
  props.k.box({ side: props.wd.dark, top: null, u0: -W / 2 + 0.1, y0: 0.9, v0: -D / 2, u1: W / 2 - 0.1, y1: 0.94, v1: -D / 2 + 0.06 })
  for (const t = { value: 0 }; t.value < 5; t.value++)
    props.k.box({
      side: t.value % 2 ? M.iron : props.wd.dark,
      top: null,
      u0: -W / 2 + 0.2 + t.value * ((W - 0.4) / 4) - 0.015,
      y0: 0.9,
      v0: -D / 2 + 0.06,
      u1: -W / 2 + 0.2 + t.value * ((W - 0.4) / 4) + 0.015,
      y1: 1.12,
      v1: -D / 2 + 0.08,
    })
  if (kind === "joiner") {
    // a vice at the left end, a plank in it, shavings on the top
    props.k.box({ side: props.wd.dark, top: null, u0: -W / 2 - 0.06, y0: 0.6, v0: D / 2 - 0.3, u1: -W / 2, y1: 0.9, v1: D / 2 - 0.05 })
    props.k.box({ side: M.iron, top: null, u0: -W / 2 - 0.1, y0: 0.78, v0: D / 2 - 0.2, u1: -W / 2 - 0.06, y1: 0.82, v1: D / 2 - 0.15 })
    props.k.box({ side: props.wd.top, top: null, u0: -W / 2 + 0.1, y0: 0.9, v0: D / 2 - 0.25, u1: W * 0.15, y1: 0.95, v1: D / 2 - 0.1 })
    for (const t = { value: 0 }; t.value < 4; t.value++)
      props.k.box({
        side: M.hay,
        top: null,
        u0: W * 0.2 + r(props.seed, t.value) * W * 0.2,
        y0: 0.9,
        v0: -0.1 + r(props.seed, t.value + 9) * 0.2,
        u1: W * 0.24 + r(props.seed, t.value) * W * 0.2,
        y1: 0.91,
        v1: -0.06 + r(props.seed, t.value + 9) * 0.2,
      })
  } else if (kind === "mend") {
    // something being mended: a lantern with its glass out, a boot, small tools in a tray
    props.k.box({ side: M.iron, top: glass, u0: -W * 0.3, y0: 0.9, v0: -0.05, u1: -W * 0.3 + 0.16, y1: 1.1, v1: 0.11 })
    props.k.box({ side: colorMat(0x3a2a24), top: null, u0: 0, y0: 0.9, v0: 0, u1: 0.26, y1: 1.02, v1: 0.1 })
    props.k.box({ side: props.wd.dark, top: M.iron, u0: W * 0.2, y0: 0.9, v0: -0.1, u1: W * 0.2 + 0.25, y1: 0.94, v1: 0.08 })
  } else {
    props.k.box({ side: M.iron, top: null, u0: -0.1, y0: 0.9, v0: -0.05, u1: 0.1, y1: 0.94, v1: 0.15 })
    props.k.box({ side: props.wd.top, top: null, u0: W * 0.15, y0: 0.9, v0: 0.05, u1: W * 0.35, y1: 0.96, v1: 0.25 })
  }
}
