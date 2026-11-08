import { limbSd } from "#/lib/graphics/ray/limb-sd"
import type { Primitive, SurfaceMaterial } from "#/lib/graphics/ray/primitive-types"
import type { Vector3Tuple } from "#/lib/engine/vector3-types"
import type { BodyContext } from "#/world/scene/figure/context"
import { getSupportedThighField } from "#/world/scene/figure/get-supported-thigh-field"
import { STANDING_LEG_FOLD_LIMIT } from "#/world/scene/figure/standing-leg-fold-limit"
import { seatedSupportDepth } from "#/world/scene/figure/seated-support-depth"

type Props = { context: BodyContext; hip: Vector3Tuple; points: Vector3Tuple[]; radii: number[]; material: SurfaceMaterial }

/** 座った腿だけを支持面へ沿わせ、下腿と立位・膝立ちの距離場を保持する。 */
export function createLegLimb(props: Props): Primitive {
  const field: (ReturnType<typeof limbSd> & Pick<Primitive, "boxBounds">) | Error =
    props.points[0] === props.hip && props.context.fold > STANDING_LEG_FOLD_LIMIT && !props.context.kneelish
      ? getSupportedThighField({ points: props.points, radii: props.radii, supportY: props.context.hip[1] - seatedSupportDepth(props.context.L) })
      : limbSd(props.points, props.radii)
  if (field instanceof Error) throw field
  return props.context.push({
    kind: "sdf",
    sdLipschitz: 1,
    bounds: field.bounds,
    capsuleBounds: field.capsuleBounds,
    boxBounds: field.boxBounds,
    a: field.c,
    b: field.c,
    r: field.r,
    r2: 0,
    sd: (point) => field.sd(point),
    m: props.material,
  })
}
