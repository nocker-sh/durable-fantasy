import { getFoldedGarmentGeometry } from "#/world/scene/figure/get-folded-garment-geometry"
import { seatedSupportDepth } from "#/world/scene/figure/seated-support-depth"
import { lerpVector3 as lerp3 } from "../../../lib/engine/lerp-vector3"
import type { BodyContext } from "#/world/scene/figure/context"
import type { PrimitiveShape } from "#/lib/graphics/ray/primitive-types"
import type { Vector3Tuple as V3 } from "../../../lib/engine/vector3-types"

/** Standing and kneeling keep the native cone; a seated tunic folds its lower span forward instead of through the seat. */
export function getTunicGeometry(context: BodyContext) {
  const hem = context.UP([0, -0.13 * context.S, 0]),
    waist = context.UW([0, 0.1 * context.S, 0])
  if (context.kneelish || context.fold === 0) {
    const shape: PrimitiveShape = { kind: "cone", a: hem, b: waist, r: 0.16 * context.S, r2: 0.125 * context.S }
    return { shape, progress: (point: V3) => context.along(point, hem, waist) }
  }

  return getFoldedGarmentGeometry({
    hem,
    waist,
    hip: context.hip,
    knees: lerp3(context.J.calf_l, context.J.calf_r, 0.5),
    fold: context.fold,
    radius: 0.16 * context.S,
    waistRadius: 0.125 * context.S,
    supportDepth: seatedSupportDepth(context.L),
    shellThickness: null,
    along: context.along,
  })
}
