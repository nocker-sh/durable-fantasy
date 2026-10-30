import { getSupportedThighField } from "#/world/scene/figure/get-supported-thigh-field"
import { STANDING_LEG_FOLD_LIMIT } from "#/world/scene/figure/standing-leg-fold-limit"
import { seatedSupportDepth } from "#/world/scene/figure/seated-support-depth"
import type { Primitive } from "#/lib/graphics/ray/primitive-types"
import type { Footwear } from "#/world/scene/figure/footing"
import type { Bone } from "#/world/scene/rig"
import type { BodyContext } from "#/world/scene/figure/context"
import { lerpVector3 as lerp3 } from "#/lib/engine/lerp-vector3"
import { type Vector3Tuple as V3 } from "#/lib/engine/vector3-types"
import { addVector3 as add } from "#/lib/engine/add-vector3"
import { subtractVector3 as sub } from "#/lib/engine/subtract-vector3"
import { normalizeVector3 as norm } from "#/lib/engine/normalize-vector3"
import { scaleVector3 as mul } from "#/lib/engine/scale-vector3"
import { createSolidSurfaceMaterial } from "#/lib/graphics/ray/create-solid-surface-material"
import type { SurfaceMaterial } from "#/lib/graphics/ray/primitive-types"
import { limbSd } from "#/lib/graphics/ray/limb-sd"

function buildLegs(context: BodyContext) {
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
  const parts: Record<"l" | "r", Primitive[]> = { l: [], r: [] },
    shoeParts: Record<"l" | "r", Primitive | null> = { l: null, r: null }
  const footwear = {} as Footwear,
    knees = {} as Record<"l" | "r", { c: V3; r: number } | undefined>
  for (const s of ["l", "r"] as const) {
    const first = context.prims.length
    const hp = J[`thigh_${s}` as Bone],
      knee = J[`calf_${s}` as Bone],
      foot = J[`foot_${s}` as Bone],
      ball = J[`ball_${s}` as Bone]
    const shin = (t: number) => lerp3(knee, foot, t)
    const bootTop = shin(foot_ === "boots" ? (fem ? 0.4 : 0.3) : 0.8)
    let kneeRadius = 0
    const limb = (pts: V3[], rs: number[], m: SurfaceMaterial) => {
      pts.forEach((p, i) => {
        if (p === knee) kneeRadius = Math.max(kneeRadius, rs[i])
      })
      const l: (ReturnType<typeof limbSd> & Pick<Primitive, "boxBounds">) | Error =
        pts[0] === hp && fold > STANDING_LEG_FOLD_LIMIT && !context.kneelish ? getSupportedThighField({ points: pts, radii: rs, supportY: context.hip[1] - seatedSupportDepth(L) }) : limbSd(pts, rs)
      if (l instanceof Error) throw l
      const primitive = push({ kind: "sdf", sdLipschitz: 1, bounds: l.bounds, capsuleBounds: l.capsuleBounds, boxBounds: l.boxBounds, a: l.c, b: l.c, r: l.r, r2: 0, sd: (p) => l.sd(p), m })
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
    const fw = norm(sub(ball, foot))
    const heel = add(foot, mul(fw, -0.02 * S)),
      toe = add(ball, mul(fw, (foot_ === "clogs" ? 0.075 : 0.065) * S))
    const sr = foot_ === "shoes" || foot_ === "wraps" ? 0.068 : 0.078
    const shoe = { a: [heel[0], heel[1] - 0.004, heel[2]] as V3, b: toe, r: sr * S }
    footwear[s] = shoe
    knees[s] = kneeRadius ? { c: knee, r: kneeRadius } : undefined
    shoeParts[s] = push({ kind: "cap", ...shoe, r2: 0, m: foot_ === "clogs" ? (p, n) => ["wood", n[1] > 0.5 ? 0.15 : 0] : createSolidSurfaceMaterial(shoes, -0.1) })
    parts[s] = context.prims.slice(first)
  }
  return { footwear, knees, trouserParts, parts, shoeParts }
}

export { buildLegs }
