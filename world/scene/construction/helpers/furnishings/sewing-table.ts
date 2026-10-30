import { M } from "#/world/scene/construction/materials"
import type { Wood } from "#/world/scene/construction/furnishings"
import { cloth, willow } from "#/world/scene/construction/furnishings"
import { Kit } from "#/world/scene/construction/kit"
import { r } from "#/world/scene/construction/helpers/furnishings/r"

export function sewingTable(k: Kit, wd: Wood, seed: number) {
  const WSource = k,
    W = WSource.W,
    D = WSource.D
  k.legs({ m: wd.dark, h: 0.72, t: 0.05 })
  k.slab({ m: wd.top, y: 0.72, t: 0.05 })
  // cloth spread out, a pair of shears, a pincushion, a basket of thread
  const c = cloth[Math.floor(r(seed, 9) * cloth.length)]
  k.box({ side: c, top: c, u0: -W * 0.4, y0: 0.77, v0: -D * 0.3, u1: W * 0.15, y1: 0.785, v1: D * 0.35 })
  k.box({ side: M.iron, top: null, u0: W * 0.2, y0: 0.77, v0: -0.05, u1: W * 0.32, y1: 0.78, v1: -0.02 })
  k.cyl({ side: cloth[0], top: null, u: W * 0.3, v: D * 0.2, y0: 0.77, y1: 0.81, r0: 0.04, r1: 0.03 })
  k.cyl({ side: willow, top: null, u: W * 0.35, v: -D * 0.25, y0: 0.77, y1: 0.86, r0: 0.07, r1: 0.09 })
}
