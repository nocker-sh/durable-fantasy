import type { Wood } from "#/world/scene/construction/furnishings"
import { cloth } from "#/world/scene/construction/furnishings"
import { Kit } from "#/world/scene/construction/kit"
import { r } from "#/world/scene/construction/helpers/furnishings/r"

export function settle(k: Kit, wd: Wood, seed: number) {
  // a bench with a back, a cushion along it
  const WSource = k,
    W = WSource.W,
    D = WSource.D
  for (const u of [-W / 2 + 0.05, 0, W / 2 - 0.05])
    for (const v of [-D / 2 + 0.05, D / 2 - 0.05]) k.box({ side: wd.dark, top: null, u0: u - 0.03, y0: 0, v0: v - 0.03, u1: u + 0.03, y1: 0.42, v1: v + 0.03 })
  k.slab({ m: wd.top, y: 0.42, t: 0.05 })
  k.box({ side: wd.body, top: wd.top, u0: -W / 2, y0: 0.47, v0: -D / 2, u1: W / 2, y1: 0.92, v1: -D / 2 + 0.05 })
  if (wd.trim) k.box({ side: wd.trim, top: null, u0: -W * 0.3, y0: 0.64, v0: -D / 2 + 0.05, u1: W * 0.3, y1: 0.78, v1: -D / 2 + 0.055 })
  for (const s of [-1, 1]) k.box({ side: wd.dark, top: wd.top, u0: (s * W) / 2 - 0.04, y0: 0.47, v0: -D / 2, u1: (s * W) / 2 + 0.0, y1: 0.66, v1: D / 2 })
  const c = cloth[Math.floor(r(seed, 2) * cloth.length)]
  if (r(seed, 3) > 0.35) k.box({ side: c, top: c, u0: -W / 2 + 0.1, y0: 0.47, v0: -D / 2 + 0.07, u1: -W / 2 + 0.1 + W * 0.45, y1: 0.52, v1: D / 2 - 0.04 })
}
