import { createColorMaterial as colorMat } from "#/lib/graphics/create-color-material"
import type { Wood } from "#/world/scene/construction/furnishings"
import { cloth, glass, clay, glaze, brass } from "#/world/scene/construction/furnishings"
import { Kit } from "#/world/scene/construction/kit"
import { r } from "#/world/scene/construction/helpers/furnishings/r"
import { frame } from "#/world/scene/construction/helpers/furnishings/frame"
import { row } from "#/world/scene/construction/helpers/furnishings/row"

type Props = {
  k: Kit
  wd: Wood
  seed: number
  what: "bottles" | "thread" | "leather" | "plates"
}

export function tiltedShelf(props: Props) {
  const WSource = props.k,
    W = WSource.W,
    D = WSource.D
  if (props.what === "plates") {
    // a dresser: cupboard doors below, plates stood along the rails above
    props.k.box({ side: props.wd.body, top: props.wd.top, u0: -W / 2, y0: 0, v0: -D / 2, u1: W / 2, y1: 0.85, v1: D / 2 })
    for (const s of [-1, 1]) {
      props.k.box({ side: props.wd.trim ?? props.wd.dark, top: null, u0: (s * W) / 4 - W / 4 + 0.04, y0: 0.08, v0: D / 2, u1: (s * W) / 4 + W / 4 - 0.04, y1: 0.78, v1: D / 2 + 0.015 })
      props.k.box({ side: brass, top: null, u0: s * 0.04 - 0.015, y0: 0.45, v0: D / 2 + 0.015, u1: s * 0.04 + 0.015, y1: 0.5, v1: D / 2 + 0.03 })
    }
    const top = props.k.D * 0.5
    for (const su of [-1, 1])
      props.k.box({ side: props.wd.dark, top: props.wd.top, u0: (su * W) / 2 - (su > 0 ? 0.05 : 0), y0: 0.85, v0: -D / 2, u1: (su * W) / 2 + (su < 0 ? 0.05 : 0), y1: 1.85, v1: -D / 2 + top })
    props.k.box({ side: props.wd.body, top: null, u0: -W / 2, y0: 0.85, v0: -D / 2, u1: W / 2, y1: 1.85, v1: -D / 2 + 0.03 })
    props.k.box({ side: props.wd.top, top: props.wd.top, u0: -W / 2 - 0.03, y0: 1.85, v0: -D / 2, u1: W / 2 + 0.03, y1: 1.9, v1: -D / 2 + top + 0.02 })
    for (const y of [1.2, 1.55]) {
      props.k.box({ side: props.wd.top, top: props.wd.top, u0: -W / 2, y0: y, v0: -D / 2, u1: W / 2, y1: y + 0.03, v1: -D / 2 + top })
      const u = { value: -W / 2 + 0.08 }
      for (const t = { value: 0 }; u.value < W / 2 - 0.12; t.value++) {
        const g = glaze[(t.value + Math.floor(r(props.seed, t.value) * 4)) % glaze.length]
        props.k.box({ side: g, top: g, u0: u.value, y0: y + 0.03, v0: -D / 2 + 0.06, u1: u.value + 0.025, y1: y + 0.3, v1: -D / 2 + 0.09 })
        u.value += 0.12
      }
    }
    for (const t = { value: 0 }; t.value < 4; t.value++)
      props.k.cyl({
        side: t.value % 2 ? clay : glaze[t.value % glaze.length],
        top: null,
        u: -W / 2 + 0.15 + t.value * ((W - 0.3) / 3),
        v: -D / 2 + 0.12,
        y0: 0.88,
        y1: 1.0 + r(props.seed, t.value + 7) * 0.1,
        r0: 0.05,
        r1: 0.07,
        seg: 7,
      })
    return
  }
  const boards = [0.04, 0.5, 0.95, 1.4]
  frame({ k: props.k, wd: props.wd, h: 1.8, boards: boards })
  boards.forEach((b, i) =>
    row({
      k: props.k,
      y: b,
      from: -W / 2 + 0.08,
      to: W / 2 - 0.1,
      put: (u, j) => {
        if (props.what === "bottles") {
          const g = [glass, glaze[0], colorMat(0x3a5a3a), colorMat(0x6a2a2a)][Math.floor(r(props.seed + i, j) * 4)]
          props.k.cyl({ side: g, top: null, u: u + 0.04, v: 0, y0: b + 0.035, y1: b + 0.25, r0: 0.04, r1: 0.04, seg: 6 })
          props.k.cyl({ side: g, top: null, u: u + 0.04, v: 0, y0: b + 0.25, y1: b + 0.33, r0: 0.015, r1: 0.015, seg: 5 })
          return 0.1
        }
        if (props.what === "thread") {
          const c = cloth[Math.floor(r(props.seed + i, j) * cloth.length)]
          props.k.cyl({ side: c, top: c, u: u + 0.05, v: 0, y0: b + 0.035, y1: b + 0.14, r0: 0.045, r1: 0.045, seg: 6 })
          return 0.11
        }
        // rolled hides, their ends showing
        props.k.cyl({ side: colorMat([0x8a6a4a, 0x6a4632, 0x4a3226][j % 3]), top: null, u: u + 0.09, v: 0, y0: b + 0.035, y1: b + 0.2, r0: 0.08, r1: 0.08, seg: 7 })
        return 0.2
      },
    }),
  )
}
