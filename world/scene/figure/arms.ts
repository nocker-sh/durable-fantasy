import { nativeArmSurfaces } from "#/world/scene/figure/native-arm-surfaces"
import { armGripPoint } from "#/world/scene/figure/arm-grip-point"
import { qrot } from "../../../lib/engine/qrot"
import type { Bone } from "#/world/scene/rig"
import type { BodyContext } from "./context"
import type { ClothesContext } from "./clothes"
import { type Vector3Tuple as V3 } from "../../../lib/engine/vector3-types"
import { normalizeVector3 as norm } from "../../../lib/engine/normalize-vector3"
import { subtractVector3 as sub } from "../../../lib/engine/subtract-vector3"
import { addVector3 as add } from "../../../lib/engine/add-vector3"
import { scaleVector3 as mul } from "../../../lib/engine/scale-vector3"
import { dotVector3 as dot } from "../../../lib/engine/dot-vector3"

function buildArms(context: BodyContext & ClothesContext) {
  const JSource = context,
    J = JSource.J,
    L = JSource.L,
    fem = JSource.fem,
    top = JSource.top,
    S = JSource.S,
    skin = JSource.skin,
    push = JSource.push,
    collar = JSource.collar,
    K = JSource.K
  // ---- arms (the character's left is +X)
  const hands: Record<string, { p: V3; dir: V3; up: V3 }> = {}
  const parts = {} as Record<"l" | "r", typeof context.prims>
  for (const s of ["l", "r"] as const) {
    const first = context.prims.length
    const sh = J[`upperarm_${s}` as Bone],
      elbow = J[`lowerarm_${s}` as Bone],
      hand = J[`hand_${s}` as Bone]
    const dirFoSource = nativeArmSurfaces({ scale: S, shoulder: sh, elbow: elbow, wrist: hand, grip: K.handGrips?.[s] }),
      dirFo = dirFoSource.direction,
      am = dirFoSource.arm,
      cf = dirFoSource.cuff
    const sleeve = L.jacket ?? (fem && L.bodice ? "cLinen" : top)
    // shoulder -> elbow -> wrist -> palm -> fingertips, one surface; the hand is its skin-coloured end
    // the sleeve widens a little toward the wrist, like a loose shirt sleeve
    const handM = L.gloves ?? skin
    push({
      kind: "sdf",
      sdLipschitz: 1,
      bounds: am.bounds,
      capsuleBounds: am.capsuleBounds,
      a: am.c,
      b: am.c,
      r: am.r,
      r2: 0,
      sd: (p) => am.sd(p),
      m: (p) => {
        const h = { i: 0 }
        am.sd(p, h)
        return h.i >= 2 ? [handM, 0.05] : [sleeve, 0]
      },
    })
    const cuffR = L.trim ?? (collar && collar !== sleeve ? collar : "cLinen")
    // turned-back cuff at the wrist
    push({ kind: "sdf", sdLipschitz: 1, bounds: cf.bounds, capsuleBounds: cf.capsuleBounds, a: cf.c, b: cf.c, r: cf.r, r2: 0, sd: (p) => cf.sd(p), m: () => [cuffR, 0.05] })
    parts[s] = context.prims.slice(first)
    // grip axis: forward through the fist in the T-pose (thumb side)
    const grip = norm(qrot(K.q[`hand_${s}` as Bone], [0, 0, 1]))
    hands[s === "l" ? "L" : "R"] = { p: armGripPoint(elbow, hand), dir: dirFo, up: grip }
  }
  if (L.armor) {
    // pauldrons: two overlapping lames capping each shoulder
    for (const s of ["l", "r"] as const) {
      const sh = J[`upperarm_${s}` as Bone],
        out = norm(sub(sh, J.spine_03))
      for (const entry of [
        [0, 0.012],
        [1, -0.03],
      ] as const) {
        const k = entry[0]
        const dy = entry[1]

        const c0 = add(add(sh, mul(out, 0.008 + k * 0.012)), [0, dy * S, 0])
        push({ kind: "sph", a: c0, b: c0, r: (0.068 - k * 0.006) * S, r2: 0, sy: 0.62, m: (p, n, l) => [L.armor!, (k ? -0.12 : 0.05) + (dot(n, l) > 0.7 ? 0.25 : 0)] })
      }
    }
  }
  return { hands, parts }
}

type ArmsContext = ReturnType<typeof buildArms>

export { buildArms, type ArmsContext }
