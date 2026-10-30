import type { Wood } from "#/world/scene/construction/furnishings"
import { Kit } from "#/world/scene/construction/kit"
import { r } from "#/world/scene/construction/helpers/furnishings/r"
import { wheel } from "#/world/scene/construction/helpers/furnishings/wheel"
import { sacks } from "#/world/scene/construction/helpers/furnishings/sacks"
import { shrink } from "#/world/scene/construction/helpers/furnishings/shrink"

export function handcart(k: Kit, wd: Wood, seed: number) {
  // a two-wheeled handcart, its shafts resting on the floor, a sack or two in it
  const WSource = k,
    W = WSource.W,
    D = WSource.D
  const R = 0.38
  const v0 = -D / 2 + 0.05,
    v1 = D / 2 - 0.75
  k.box({ side: wd.top, top: wd.top, u0: -W / 2 + 0.12, y0: R + 0.02, v0: v0, u1: W / 2 - 0.12, y1: R + 0.06, v1: v1 })
  for (const su of [-1, 1]) k.box({ side: wd.body, top: wd.top, u0: su * (W / 2 - 0.12) - 0.02, y0: R + 0.06, v0: v0, u1: su * (W / 2 - 0.12) + 0.02, y1: R + 0.38, v1: v1 })
  k.box({ side: wd.body, top: wd.top, u0: -W / 2 + 0.12, y0: R + 0.06, v0: v0, u1: W / 2 - 0.12, y1: R + 0.38, v1: v0 + 0.04 })
  for (const su of [-1, 1]) {
    // the shafts, sloping from the bed down to the floor at the front
    const u = su * (W / 2 - 0.2)
    for (const q = { value: 0 }; q.value < 8; q.value++) {
      const v = v1 + (q.value / 8) * (D / 2 - v1),
        y = R + 0.02 - (q.value / 8) * (R - 0.04)
      k.box({ side: wd.dark, top: null, u0: u - 0.025, y0: y - 0.03, v0: v, u1: u + 0.025, y1: y + 0.02, v1: v + (D / 2 - v1) / 8 + 0.01 })
    }
    wheel({ k: k, rim: wd.dark, spoke: wd.dark, u: su * (W / 2 - 0.04), cy: R + 0.02, R: R, t: 0.05, n: 24 })
  }
  k.box({ side: wd.dark, top: null, u0: -W / 2 + 0.04, y0: R - 0.01, v0: (v0 + v1) / 2 - 0.03, u1: W / 2 - 0.04, y1: R + 0.05, v1: (v0 + v1) / 2 + 0.03 }) // the axle
  if (r(seed, 1) > 0.3) sacks(new Kit(k.gb, { ...k.s, y: k.s.y + R + 0.06, ...shrink(k, 0.5, (v0 + v1) / 2) }), seed, "wool")
}
