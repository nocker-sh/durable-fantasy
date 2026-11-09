import type { Wood } from "#/world/scene/construction/furnishings"
import { cloth, glass, brass } from "#/world/scene/construction/furnishings"
import { Kit } from "#/world/scene/construction/kit"
import { r } from "#/world/scene/construction/helpers/furnishings/r"

export function vitrine(k: Kit, wd: Wood, seed: number) {
  // a glass-fronted case with a lock, small precious things on blue cloth
  const WSource = k,
    W = WSource.W,
    D = WSource.D
  k.box({ side: wd.body, top: wd.top, u0: -W / 2, y0: 0, v0: -D / 2, u1: W / 2, y1: 0.75, v1: D / 2 })
  k.box({ side: wd.dark, top: null, u0: -W / 2, y0: 0.75, v0: -D / 2, u1: -W / 2 + 0.05, y1: 1.05, v1: D / 2 })
  k.box({ side: wd.dark, top: null, u0: W / 2 - 0.05, y0: 0.75, v0: -D / 2, u1: W / 2, y1: 1.05, v1: D / 2 })
  k.box({ side: wd.dark, top: wd.top, u0: -W / 2, y0: 1.05, v0: -D / 2, u1: W / 2, y1: 1.1, v1: D / 2 })
  k.box({ side: cloth[1], top: null, u0: -W / 2 + 0.05, y0: 0.75, v0: -D / 2 + 0.03, u1: W / 2 - 0.05, y1: 0.76, v1: D / 2 - 0.03 })
  for (const t = { value: 0 }; t.value < 5; t.value++)
    k.cyl({ side: t.value % 2 ? brass : glass, top: null, u: -W / 2 + 0.2 + t.value * ((W - 0.4) / 4), v: 0, y0: 0.76, y1: 0.8 + r(seed, t.value) * 0.05, r0: 0.04, r1: 0.04, seg: 6 })
  k.box({ side: glass, top: null, u0: -W / 2 + 0.05, y0: 0.76, v0: D / 2 - 0.02, u1: W / 2 - 0.05, y1: 1.05, v1: D / 2 }) // the glass
  k.box({ side: brass, top: null, u0: -0.03, y0: 0.55, v0: D / 2, u1: 0.03, y1: 0.62, v1: D / 2 + 0.02 })
}
