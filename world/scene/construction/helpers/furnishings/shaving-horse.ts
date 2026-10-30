import { M } from "#/world/scene/construction/materials"
import type { Wood } from "#/world/scene/construction/furnishings"
import { Kit } from "#/world/scene/construction/kit"

export function shavingHorse(k: Kit, wd: Wood) {
  // the bench a bow maker sits astride, a stave clamped under its head, a drawknife on it
  const WSource = k,
    W = WSource.W
  k.box({ side: wd.body, top: wd.top, u0: -W / 2, y0: 0.45, v0: -0.12, u1: W / 2, y1: 0.52, v1: 0.12 })
  for (const entry of [
    [-W / 2 + 0.1, -0.12],
    [-W / 2 + 0.1, 0.12],
    [W / 2 - 0.1, 0],
  ]) {
    const u = entry[0]
    const v = entry[1]
    k.box({ side: wd.dark, top: null, u0: u - 0.03, y0: 0, v0: v - 0.03, u1: u + 0.03, y1: 0.45, v1: v + 0.03 })
  }
  k.box({ side: wd.top, top: null, u0: 0.05, y0: 0.52, v0: -0.1, u1: W / 2 - 0.1, y1: 0.6, v1: 0.1 }) // the ramp
  k.box({ side: wd.dark, top: null, u0: 0.1, y0: 0.6, v0: -0.04, u1: 0.16, y1: 0.95, v1: 0.04 }) // the head
  k.box({ side: M.woodV, top: null, u0: -0.1, y0: 0.6, v0: -0.03, u1: W / 2, y1: 0.64, v1: 0.03 }) // the stave
  k.box({ side: M.iron, top: null, u0: -0.2, y0: 0.52, v0: 0.06, u1: 0.1, y1: 0.54, v1: 0.1 })
}
