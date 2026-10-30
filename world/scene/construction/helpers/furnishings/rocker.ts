import type { Wood } from "#/world/scene/construction/furnishings"
import { cloth } from "#/world/scene/construction/furnishings"
import { Kit } from "#/world/scene/construction/kit"
import { r } from "#/world/scene/construction/helpers/furnishings/r"

export function rocker(k: Kit, wd: Wood, seed: number) {
  // a rocking chair by the fire: curved rockers (in three pieces), arms, a tall back, a blanket over it
  const WSource = k,
    W = WSource.W,
    D = WSource.D
  const s = W * 0.8
  for (const su of [-1, 1]) {
    const u = su * (s / 2 - 0.03)
    k.box({ side: wd.dark, top: null, u0: u - 0.025, y0: 0.02, v0: -D * 0.25, u1: u + 0.025, y1: 0.06, v1: D * 0.25 })
    k.box({ side: wd.dark, top: null, u0: u - 0.025, y0: 0.05, v0: -D * 0.45, u1: u + 0.025, y1: 0.09, v1: -D * 0.25 })
    k.box({ side: wd.dark, top: null, u0: u - 0.025, y0: 0.05, v0: D * 0.25, u1: u + 0.025, y1: 0.09, v1: D * 0.45 })
    for (const v of [-D * 0.2, D * 0.2]) k.box({ side: wd.dark, top: null, u0: u - 0.025, y0: 0.04, v0: v - 0.025, u1: u + 0.025, y1: 0.42, v1: v + 0.025 })
    k.box({ side: wd.top, top: null, u0: u - 0.03, y0: 0.62, v0: -D * 0.25, u1: u + 0.03, y1: 0.66, v1: D * 0.25 }) // arm
    k.box({ side: wd.dark, top: null, u0: u - 0.025, y0: 0.42, v0: D * 0.2 - 0.025, u1: u + 0.025, y1: 0.62, v1: D * 0.2 + 0.025 })
  }
  k.slab({ m: wd.top, y: 0.42, t: 0.05, W: s, D: D * 0.5 })
  k.box({ side: wd.body, top: wd.top, u0: -s / 2, y0: 0.47, v0: -D * 0.25, u1: s / 2, y1: 1.15, v1: -D * 0.25 + 0.05 })
  const c = cloth[Math.floor(r(seed, 4) * cloth.length)]
  k.box({ side: c, top: c, u0: -s / 2 + 0.06, y0: 0.6, v0: -D * 0.25 + 0.05, u1: s / 2 - 0.06, y1: 1.12, v1: -D * 0.25 + 0.08 })
  k.box({ side: c, top: c, u0: -s / 2 + 0.06, y0: 0.47, v0: -D * 0.2, u1: s / 2 - 0.06, y1: 0.5, v1: D * 0.15 })
}
