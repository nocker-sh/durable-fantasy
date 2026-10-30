import { getFoldedGarmentGeometry } from "#/world/scene/figure/get-folded-garment-geometry"
import { seatedSupportDepth } from "#/world/scene/figure/seated-support-depth"
import { lerpVector3 as lerp3 } from "../../../lib/engine/lerp-vector3"
import { dotVector3 as dot } from "../../../lib/engine/dot-vector3"
import { subtractVector3 as sub } from "../../../lib/engine/subtract-vector3"
import type { BodyContext } from "#/world/scene/figure/context"
import type { Vector3Tuple as V3 } from "../../../lib/engine/vector3-types"

/** Gather seated coat tails over the thighs; keep the native front opening, lining and trim. */
export function buildCoatTails(context: BodyContext) {
  const hem = context.UP([0, -0.3 * context.S, -0.01]),
    waist = context.UW([0, 0.1 * context.S, 0]),
    ramp = context.L.jacket
  if (!ramp) throw new Error("Coat tails require a jacket")
  if (context.kneelish || context.fold === 0)
    return context.openShell({ hemC: hem, topC: waist, rHem: 0.205 * context.S, rTop: 0.138 * context.S, frame: "pelvis", open: 0.02 * context.S, flare: 0.3, ramp: ramp })
  const geometry = getFoldedGarmentGeometry({
    hem,
    waist,
    hip: context.hip,
    knees: lerp3(context.J.calf_l, context.J.calf_r, 0.5),
    fold: context.fold,
    radius: 0.205 * context.S,
    waistRadius: 0.138 * context.S,
    supportDepth: seatedSupportDepth(context.L),
    shellThickness: 0.01 * context.S,
    along: context.along,
  })
  if (geometry instanceof Error) throw geometry
  const cut = (point: V3) => {
    const local = context.local(point, "pelvis"),
      forward = Math.max(0, dot(sub(point, geometry.join), geometry.forward))
    return Math.min(0.02 * context.S + 0.3 * forward - Math.abs(local[0]), local[2])
  }

  return context.push({
    ...geometry.shape,
    sdLipschitz: Math.max(geometry.shape.sdLipschitz, 1.3),
    sd: (point) => Math.max(geometry.shape.sd(point), cut(point)),
    m: (point) => {
      if (geometry.radialValue(point) < -0.01 * context.S) return [ramp, -0.3]
      if (cut(point) > -0.014 * context.S || geometry.progress(point) < 0.07) return context.trimM(ramp, 0)
      return [ramp, 0]
    },
  })
}
