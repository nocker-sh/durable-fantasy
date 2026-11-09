import { createLegLimb } from "#/world/scene/figure/create-leg-limb"
import { getShoeCapsule } from "#/world/scene/figure/get-shoe-capsule"
import { STANDING_LEG_FOLD_LIMIT } from "#/world/scene/figure/standing-leg-fold-limit"
import type { Primitive } from "#/lib/graphics/ray/primitive-types"
import type { BodyContext } from "#/world/scene/figure/context"
import { lerpVector3 as lerp3 } from "#/lib/engine/lerp-vector3"
import { type Vector3Tuple as V3 } from "#/lib/engine/vector3-types"
import { addVector3 as add } from "#/lib/engine/add-vector3"
import { subtractVector3 as sub } from "#/lib/engine/subtract-vector3"
import { createSolidSurfaceMaterial } from "#/lib/graphics/ray/create-solid-surface-material"
import type { SurfaceMaterial } from "#/lib/graphics/ray/primitive-types"
import { limbSd } from "#/lib/graphics/ray/limb-sd"

export function buildLeg(context: BodyContext, side: "l" | "r") {
  const JSource = context,
    J = JSource.J,
    foot_ = JSource.foot_,
    fem = JSource.fem,
    push = JSource.push,
    fold = JSource.fold,
    legRamp = JSource.legRamp,
    legs = JSource.legs,
    S = JSource.S,
    L = JSource.L,
    shoes = JSource.shoes,
    along = JSource.along
  const trouserParts: Primitive[] = []
  const first = context.prims.length
  const hp = J[`thigh_${side}`],
    knee = J[`calf_${side}`],
    foot = J[`foot_${side}`],
    ball = J[`ball_${side}`]
  const shin = (t: number) => lerp3(knee, foot, t)
  const bootTop = shin(foot_ === "boots" ? (fem ? 0.4 : 0.3) : 0.8)
  const state = { kneeRadius: 0 }
  const limb = (pts: V3[], rs: number[], m: SurfaceMaterial) => {
    pts.forEach((p, i) => {
      if (p === knee) state.kneeRadius = Math.max(state.kneeRadius, rs[i])
    })
    const primitive = createLegLimb({ context, hip: hp, points: pts, radii: rs, material: m })
    if (pts[0] === hp) trouserParts.push(primitive)
  }
  if (!fem || fold > STANDING_LEG_FOLD_LIMIT) {
    const pm = createSolidSurfaceMaterial(fem ? "cLinen" : legRamp)
    if (legs === "breeches") {
      // knee breeches gathered under the knee, stockings below
      limb([hp, knee, shin(0.12)], [0.064 * S, 0.062 * S, 0.056 * S], pm)
      limb([shin(0.1), foot], [0.042 * S, 0.038 * S], createSolidSurfaceMaterial(L.hose ?? "cCream", -0.05))
    } else if (legs === "straight" || foot_ !== "boots") {
      // straight trousers to the ankle
      limb([hp, knee, shin(foot_ === "boots" ? 0.5 : 0.82)], [0.06 * S, 0.055 * S, 0.054 * S], pm)
    } else {
      // loose trousers: full at the thigh, ballooning again where they tuck into the boot
      limb([hp, knee, lerp3(bootTop, foot, 0.25)], [0.062 * S, 0.056 * S, 0.06 * S], pm)
    }
  } else {
    // stockings between the skirt hem and the shoe
    const from = L.skirt === "short" || L.skirt === "mid" ? [lerp3(hp, knee, 0.45), knee] : [shin(0.1)]
    limb([...from, foot_ === "boots" ? bootTop : foot], [...from.map(() => 0.044 * S), 0.037 * S], createSolidSurfaceMaterial(L.hose ?? L.bottom ?? "cLinen", -0.05))
  }
  if (foot_ === "boots") {
    // boot shaft with a turned-down cuff
    limb([bootTop, foot], [0.056 * S, 0.062 * S], createSolidSurfaceMaterial(shoes, -0.05))
    limb([add(bootTop, [0, 0.008 * S, 0]), lerp3(bootTop, foot, 0.3)], [0.082 * S, 0.078 * S], createSolidSurfaceMaterial(shoes, 0.3))
  } else if (foot_ === "wraps") {
    // cloth strips wound round the shin, crossing bands
    const wr = limbSd([shin(0.35), foot], [0.05 * S, 0.052 * S])
    push({
      kind: "sdf",
      bounds: wr.bounds,
      capsuleBounds: wr.capsuleBounds,
      a: wr.c,
      b: wr.c,
      r: wr.r,
      r2: 0,
      sd: (p) => wr.sd(p),
      m: (p) => {
        const t = along(p, shin(0.35), foot),
          lp = sub(p, foot)
        return ["cLinen", Math.sin(t * 34 + Math.atan2(lp[0], lp[2]) * 1.2) > 0.3 ? -0.3 : 0]
      },
    })
  }
  // shoe: a flattened capsule from heel to toe (clogs: a rounder wooden block)
  const shoe = getShoeCapsule({ foot, ball, kind: foot_, scale: S })
  const kneeSupport = state.kneeRadius ? { c: knee, r: state.kneeRadius } : undefined
  const shoePart = push({ kind: "cap", ...shoe, r2: 0, m: foot_ === "clogs" ? (p, n) => ["wood", n[1] > 0.5 ? 0.15 : 0] : createSolidSurfaceMaterial(shoes, -0.1) })
  return { footwear: shoe, knee: kneeSupport, trouserParts, parts: context.prims.slice(first), shoePart }
}
