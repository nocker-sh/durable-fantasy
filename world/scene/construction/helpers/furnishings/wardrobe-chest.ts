import { M } from "#/world/scene/construction/materials"
import type { Wood } from "#/world/scene/construction/furnishings"
import { cloth, linen } from "#/world/scene/construction/furnishings"
import { Kit } from "#/world/scene/construction/kit"
import { r } from "#/world/scene/construction/helpers/furnishings/r"

export function wardrobeChest(k: Kit, wd: Wood, seed: number) {
  // a chest for clothes: a lid, iron straps and a lock; a painted one has a panel of flowers
  const WSource = k,
    W = WSource.W,
    D = WSource.D
  k.box({ side: wd.dark, top: null, u0: -W / 2 + 0.03, y0: 0, v0: -D / 2 + 0.03, u1: W / 2 - 0.03, y1: 0.08, v1: D / 2 - 0.03 })
  k.box({ side: wd.body, top: null, u0: -W / 2, y0: 0.08, v0: -D / 2, u1: W / 2, y1: 0.55, v1: D / 2 })
  k.box({ side: wd.top, top: wd.top, u0: -W / 2 - 0.02, y0: 0.55, v0: -D / 2 - 0.02, u1: W / 2 + 0.02, y1: 0.62, v1: D / 2 + 0.02 })
  if (wd.trim) {
    for (const su of [-1, 1]) k.box({ side: wd.trim, top: null, u0: su * W * 0.25 - W * 0.17, y0: 0.18, v0: D / 2, u1: su * W * 0.25 + W * 0.17, y1: 0.48, v1: D / 2 + 0.005 })
    for (const su of [-1, 1])
      k.box({ side: cloth[Math.floor(r(seed, 3 + su) * cloth.length)], top: null, u0: su * W * 0.25 - 0.05, y0: 0.28, v0: D / 2 + 0.005, u1: su * W * 0.25 + 0.05, y1: 0.38, v1: D / 2 + 0.01 })
  } else for (const t of [-0.32, 0.32]) k.box({ side: M.iron, top: M.iron, u0: t * W - 0.025, y0: 0.08, v0: -D / 2 - 0.01, u1: t * W + 0.025, y1: 0.63, v1: D / 2 + 0.01 })
  k.box({ side: M.iron, top: null, u0: -0.05, y0: 0.42, v0: D / 2, u1: 0.05, y1: 0.54, v1: D / 2 + 0.02 })
  if (r(seed, 8) > 0.6) k.box({ side: linen, top: linen, u0: -W * 0.3, y0: 0.62, v0: -D * 0.3, u1: W * 0.1, y1: 0.66, v1: D * 0.3 }) // a folded shirt left on it
}
