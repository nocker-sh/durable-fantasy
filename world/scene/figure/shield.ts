import { qrot } from "../../../lib/engine/qrot"
import type { BodyContext } from "./context"
import type { ArmsContext } from "./arms"
import { normalizeVector3 as norm } from "../../../lib/engine/normalize-vector3"
import { addVector3 as add } from "../../../lib/engine/add-vector3"
import { scaleVector3 as mul } from "../../../lib/engine/scale-vector3"
import { subtractVector3 as sub } from "../../../lib/engine/subtract-vector3"
import { crossVector3 as cross } from "../../../lib/engine/cross-vector3"
import { dotVector3 as dot } from "../../../lib/engine/dot-vector3"
import { frameSd } from "#/lib/graphics/ray/frame-sd"

function buildShield(context: BodyContext & ArmsContext) {
  const LSource = context,
    L = LSource.L,
    K = LSource.K,
    hands = LSource.hands,
    push = LSource.push
  // ---- shield on the left forearm, facing out from the chest
  if (L.shield) {
    const fwd = qrot(K.q.spine_02, [0, 0, 1]),
      side = qrot(K.q.spine_02, [1, 0, 0])
    const N = norm(add(fwd, mul(side, 0.5)))
    const Y = norm(sub([0, 1, 0], mul(N, N[1]))),
      X = cross(Y, N)
    const kite = L.shield === "kite",
      R0 = L.shield === "buckler" ? 0.085 : kite ? 0.12 : 0.15
    const c = add(add(hands.L.p, mul(N, 0.05)), [0, kite ? -0.02 : 0, 0])
    const outline = (x: number, y: number) => (kite ? (y > 0.04 ? Math.hypot(x, y - 0.04) - R0 : Math.abs(x) - R0 * Math.max(0, (y + 0.26) / 0.3)) : Math.hypot(x, y) - R0)
    const bow = (x: number, y: number) => (kite ? x * x : x * x + y * y) * 1.6 // dished toward the bearer
    const f = frameSd({ c: c, X: X, Y: Y, Z: N, f: (x, y, z) => Math.max(outline(x, y) * 0.9, Math.max(kite ? -y - 0.26 : -9, Math.abs(z + bow(x, y)) - 0.012)), r: 0.32 })
    const face = L.shieldRamp ?? (kite ? "cBlue" : "wood"),
      rim = L.shield === "round" ? "iron" : "gold"
    push({
      kind: "sdf",
      a: f.c,
      b: f.c,
      r: f.r,
      r2: 0,
      sd: f.sd,
      flat: 0.7,
      m: (p, n, l) => {
        const xState = f.loc(p),
          x = xState[0],
          y = xState[1],
          z = xState[2]
        if (z < -bow(x, y) - 0.004) return ["wood", -0.3] // the back
        if (outline(x, y) > -0.016) return [rim, dot(n, l) > 0.6 ? 0.3 : 0.05]
        if (!kite && Math.hypot(x, y) < 0.035) return ["iron", 0.3] // boss
        if (kite && L.crest && (Math.abs(x) < 0.02 || Math.abs(y - 0.02) < 0.02)) return [L.crest, 0.1]
        if (face === "wood") return ["wood", Math.sin(x * 70) > 0.6 ? -0.2 : 0] // planks
        return [face, 0]
      },
    })
  }
}

export { buildShield }
