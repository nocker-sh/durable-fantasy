import type { Wood } from "#/world/scene/construction/furnishings"
import { paper } from "#/world/scene/construction/furnishings"
import { Kit } from "#/world/scene/construction/kit"
import { r } from "#/world/scene/construction/helpers/furnishings/r"
import { frame } from "#/world/scene/construction/helpers/furnishings/frame"

export function pigeonholes(k: Kit, wd: Wood, seed: number) {
  // a case of pigeonholes for papers: rolled and folded, tied with tape
  const WSource = k,
    W = WSource.W,
    D = WSource.D
  const h = 1.8
  frame({ k: k, wd: wd, h: h, boards: [0.04, 0.4, 0.75, 1.1, 1.45] })
  const cols = Math.max(3, Math.round(W / 0.3))
  for (const c = { value: 1 }; c.value < cols; c.value++) {
    const u = -W / 2 + (c.value * W) / cols
    k.box({ side: wd.dark, top: null, u0: u - 0.015, y0: 0.04, v0: -D / 2, u1: u + 0.015, y1: h, v1: D / 2 })
  }
  for (const rr = { value: 0 }; rr.value < 5; rr.value++)
    for (const c = { value: 0 }; c.value < cols; c.value++) {
      if (r(seed + rr.value, c.value) < 0.2) continue
      const u = -W / 2 + ((c.value + 0.5) * W) / cols,
        b = [0.04, 0.4, 0.75, 1.1, 1.45][rr.value] + 0.035
      k.box({ side: paper, top: paper, u0: u - W / cols / 2 + 0.04, y0: b, v0: -D / 2 + 0.05, u1: u + W / cols / 2 - 0.04, y1: b + 0.08 + r(seed, rr.value * 9 + c.value) * 0.12, v1: D / 2 - 0.04 })
    }
}
