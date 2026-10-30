import type { Wood } from "#/world/scene/construction/furnishings"
import { cloth, linen } from "#/world/scene/construction/furnishings"
import { Kit } from "#/world/scene/construction/kit"
import { r } from "#/world/scene/construction/helpers/furnishings/r"

export function loom(k: Kit, wd: Wood, seed: number) {
  const WSource = k,
    W = WSource.W,
    D = WSource.D
  for (const su of [-1, 1])
    for (const sv of [-1, 1])
      k.box({
        side: wd.dark,
        top: null,
        u0: su * (W / 2 - 0.04) - 0.04,
        y0: 0,
        v0: sv * (D / 2 - 0.04) - 0.04,
        u1: su * (W / 2 - 0.04) + 0.04,
        y1: sv < 0 ? 1.55 : 0.9,
        v1: sv * (D / 2 - 0.04) + 0.04,
      })
  k.box({ side: wd.dark, top: null, u0: -W / 2, y0: 1.5, v0: -D / 2, u1: W / 2, y1: 1.56, v1: -D / 2 + 0.08 }) // the top beam
  k.box({ side: wd.dark, top: null, u0: -W / 2, y0: 0.85, v0: D / 2 - 0.08, u1: W / 2, y1: 0.92, v1: D / 2 }) // the breast beam
  // the warp running from the back beam to the front, the cloth woven so far wound on the front
  const c = cloth[Math.floor(r(seed, 1) * cloth.length)]
  k.box({ side: linen, top: null, u0: -W / 2 + 0.12, y0: 0.9, v0: -D / 2 + 0.1, u1: W / 2 - 0.12, y1: 0.92, v1: D / 2 - 0.3 })
  k.box({ side: c, top: null, u0: -W / 2 + 0.12, y0: 0.9, v0: D / 2 - 0.35, u1: W / 2 - 0.12, y1: 0.93, v1: D / 2 - 0.09 })
  k.cyl({ side: c, top: null, u: 0, v: D / 2 - 0.05, y0: 0.6, y1: 0.85, r0: 0.08, r1: 0.08 }) // the roll (stands for the cloth beam)
  k.box({ side: wd.top, top: null, u0: -W / 2 + 0.06, y0: 1.0, v0: -0.05, u1: W / 2 - 0.06, y1: 1.35, v1: 0.0 }) // the heddles
  k.box({ side: wd.top, top: null, u0: -W / 2 + 0.1, y0: 0.4, v0: D / 2 + 0.05, u1: W / 2 - 0.1, y1: 0.45, v1: D / 2 + 0.35 }) // the bench
  for (const su of [-1, 1]) k.box({ side: wd.dark, top: null, u0: su * (W / 2 - 0.12) - 0.03, y0: 0, v0: D / 2 + 0.17, u1: su * (W / 2 - 0.12) + 0.03, y1: 0.4, v1: D / 2 + 0.23 })
}
