import { M } from "#/world/scene/construction/materials"
import type { Wood } from "#/world/scene/construction/furnishings"
import { Kit } from "#/world/scene/construction/kit"
import { wheel } from "#/world/scene/construction/helpers/furnishings/wheel"

export function spinningWheel(k: Kit, wd: Wood) {
  const WSource = k,
    W = WSource.W,
    D = WSource.D
  // a slanted bench on three legs, the great wheel at one end, the flyer and a tuft of wool at the other
  for (const entry of [
    [-W * 0.3, -D * 0.35],
    [-W * 0.3, D * 0.35],
    [W * 0.3, 0],
  ]) {
    const u = entry[0]
    const v = entry[1]
    k.box({ side: wd.dark, top: null, u0: u - 0.025, y0: 0, v0: v - 0.025, u1: u + 0.025, y1: 0.42, v1: v + 0.025 })
  }
  k.box({ side: wd.top, top: wd.top, u0: -W * 0.35, y0: 0.4, v0: -D * 0.4, u1: W * 0.35, y1: 0.46, v1: D * 0.4 })
  const R = Math.min(0.32, D * 0.36),
    cy = 0.46 + R + 0.12
  for (const su of [-1, 1]) k.box({ side: wd.dark, top: null, u0: -W * 0.15 + su * 0.04 - 0.015, y0: 0.46, v0: -0.015, u1: -W * 0.15 + su * 0.04 + 0.015, y1: cy + 0.02, v1: 0.015 })
  wheel({ k: k, rim: wd.body, spoke: wd.dark, u: -W * 0.15, cy: cy, R: R })
  k.box({ side: wd.dark, top: null, u0: W * 0.15, y0: 0.46, v0: -0.02, u1: W * 0.2, y1: 0.75, v1: 0.02 })
  k.cyl({ side: M.wool, top: null, u: W * 0.25, v: 0, y0: 0.72, y1: 0.8, r0: 0.05, r1: 0.03 })
  k.box({ side: wd.dark, top: null, u0: -W * 0.1, y0: 0.02, v0: D * 0.2, u1: W * 0.1, y1: 0.05, v1: D * 0.35 }) // the treadle
}
