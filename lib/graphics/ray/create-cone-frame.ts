import { normalizeVector3 as norm } from "#/lib/engine/normalize-vector3"
import { subtractVector3 as sub } from "#/lib/engine/subtract-vector3"
import { crossVector3 as cross } from "#/lib/engine/cross-vector3"
import type { ConeFrame, ConeEndpoints as Props } from "#/lib/graphics/ray/cone-frame-types"

export function createConeFrame(p: Props): ConeFrame {
  const w = norm(sub(p.b, p.a))
  const u = norm(Math.abs(w[1]) < 0.9 ? cross(w, [0, 1, 0]) : cross(w, [1, 0, 0]))
  const v = cross(w, u)
  return Object.freeze({ u: Object.freeze(u), v: Object.freeze(v), w: Object.freeze(w), h: Math.hypot(...sub(p.b, p.a)) })
}
