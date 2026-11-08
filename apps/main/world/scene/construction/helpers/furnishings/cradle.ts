import type { Wood } from "#/world/scene/construction/furnishings"
import { cloth, linen } from "#/world/scene/construction/furnishings"
import { Kit } from "#/world/scene/construction/kit"
import { r } from "#/world/scene/construction/helpers/furnishings/r"

export function cradle(k: Kit, wd: Wood, seed: number) {
  const WSource = k,
    W = WSource.W,
    D = WSource.D
  for (const sv of [-1, 1]) k.box({ side: wd.dark, top: null, u0: -W / 2 + 0.04, y0: 0, v0: sv * (D / 2 - 0.06) - 0.03, u1: W / 2 - 0.04, y1: 0.06, v1: sv * (D / 2 - 0.06) + 0.03 }) // the rockers, across
  k.box({ side: wd.body, top: linen, u0: -W / 2 + 0.05, y0: 0.08, v0: -D / 2 + 0.03, u1: W / 2 - 0.05, y1: 0.42, v1: D / 2 - 0.03 })
  k.box({ side: wd.dark, top: wd.top, u0: -W / 2 + 0.05, y0: 0.08, v0: -D / 2 + 0.03, u1: W / 2 - 0.05, y1: 0.6, v1: -D / 2 + 0.07 }) // the hood end
  const c = cloth[Math.floor(r(seed, 5) * cloth.length)]
  k.box({ side: c, top: c, u0: -W / 2 + 0.08, y0: 0.42, v0: -D / 2 + 0.25, u1: W / 2 - 0.08, y1: 0.45, v1: D / 2 - 0.07 })
}
