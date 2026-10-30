import type { Wood } from "#/world/scene/construction/furnishings"
import { Kit } from "#/world/scene/construction/kit"

export function chair(k: Kit, wd: Wood) {
  const s = Math.min(k.W, k.D) * 0.92
  k.legs({ m: wd.dark, h: 0.44, t: 0.045, inset: 0.02, W: s, D: s })
  k.slab({ m: wd.top, y: 0.44, t: 0.05, W: s, D: s })
  // a ladder back of three rungs between two tall back posts
  for (const su of [-1, 1]) k.box({ side: wd.dark, top: null, u0: su * (s / 2 - 0.045), y0: 0.44, v0: -s / 2, u1: su * (s / 2 - 0.045) + (su < 0 ? 0.045 : -0.045) * -1, y1: 0.98, v1: -s / 2 + 0.045 })
  for (const y of [0.62, 0.76, 0.9]) k.box({ side: wd.body, top: null, u0: -s / 2 + 0.04, y0: y, v0: -s / 2 + 0.005, u1: s / 2 - 0.04, y1: y + 0.05, v1: -s / 2 + 0.04 })
}
