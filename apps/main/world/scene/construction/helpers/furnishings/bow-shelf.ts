import { M } from "#/world/scene/construction/materials"
import type { Wood } from "#/world/scene/construction/furnishings"
import { clay } from "#/world/scene/construction/furnishings"
import { Kit } from "#/world/scene/construction/kit"
import { frame } from "#/world/scene/construction/helpers/furnishings/frame"

export function bowShelf(k: Kit, wd: Wood) {
  // bows strung and unstrung stood in a row, arrows in a pot
  const WSource = k,
    W = WSource.W,
    D = WSource.D
  frame({ k: k, wd: wd, h: 1.7, boards: [0.04, 1.2], back: true })
  for (const t = { value: 0 }; t.value < Math.floor(W / 0.18); t.value++) {
    const u = -W / 2 + 0.15 + t.value * 0.18
    k.box({ side: wd.dark, top: null, u0: u - 0.015, y0: 0.08, v0: -D / 2 + 0.08, u1: u + 0.015, y1: 1.6, v1: -D / 2 + 0.12 })
    k.box({ side: M.linen, top: null, u0: u + 0.03, y0: 0.12, v0: -D / 2 + 0.08, u1: u + 0.035, y1: 1.55, v1: -D / 2 + 0.1 })
  }
  k.cyl({ side: clay, top: null, u: W / 2 - 0.15, v: 0.05, y0: 0.04, y1: 0.35, r0: 0.09, r1: 0.09 })
  for (const t = { value: 0 }; t.value < 6; t.value++)
    k.box({
      side: wd.top,
      top: null,
      u0: W / 2 - 0.2 + (t.value % 3) * 0.04,
      y0: 0.35,
      v0: 0.02 + Math.floor(t.value / 3) * 0.04,
      u1: W / 2 - 0.19 + (t.value % 3) * 0.04,
      y1: 0.75,
      v1: 0.03 + Math.floor(t.value / 3) * 0.04,
    })
}
