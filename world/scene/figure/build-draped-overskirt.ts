import { getDrapedSkirtGeometry } from "#/world/scene/figure/get-draped-skirt-geometry"
import { dotVector3 as dot } from "../../../lib/engine/dot-vector3"
import { subtractVector3 as sub } from "../../../lib/engine/subtract-vector3"
import type { BodyContext } from "#/world/scene/figure/context"
import type { Vector3Tuple as V3 } from "../../../lib/engine/vector3-types"

/** Keep the open front, lining and hem of the existing overskirt on the folded cloth path. */
export function buildDrapedOverskirt(context: BodyContext) {
  const ramp = context.L.overskirt,
    geometry = getDrapedSkirtGeometry(context, "overskirt")
  if (!ramp) throw new Error("Missing overskirt material")
  if (geometry instanceof Error) throw geometry
  const cut = (point: V3) => {
    const local = context.local(point, "pelvis"),
      forward = Math.max(0, dot(sub(point, geometry.profile.hip), geometry.profile.forward))
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
