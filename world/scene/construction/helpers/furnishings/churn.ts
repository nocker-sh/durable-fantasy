import { Kit } from "#/world/scene/construction/kit"
import type { Wood } from "#/world/scene/construction/furnishings"
import { M } from "#/world/scene/construction/materials"
export function churn(k: Kit, wd: Wood) {
  // a tall staved churn, narrower at the top, the dasher standing up through its lid
  k.cyl({
    side: wd.body,
    top: null,
    u: 0,
    v: 0,
    y0: 0,
    y1: 0.75,
    r0: 0.17,
    r1: 0.13,
    seg: 10,
  })
  for (const y of [0.1, 0.4, 0.68])
    k.cyl({
      side: M.iron,
      top: null,
      u: 0,
      v: 0,
      y0: y,
      y1: y + 0.03,
      r0: 0.175 - y * 0.05,
      r1: 0.175 - y * 0.05,
      seg: 10,
    })
  k.cyl({
    side: wd.top,
    top: wd.top,
    u: 0,
    v: 0,
    y0: 0.75,
    y1: 0.78,
    r0: 0.14,
    r1: 0.14,
    seg: 10,
  })
  k.box({
    side: wd.dark,
    top: null,
    u0: -0.015,
    y0: 0.78,
    v0: -0.015,
    u1: 0.015,
    y1: 1.15,
    v1: 0.015,
  })
  k.box({
    side: wd.dark,
    top: null,
    u0: -0.08,
    y0: 1.12,
    v0: -0.015,
    u1: 0.08,
    y1: 1.15,
    v1: 0.015,
  })
}
