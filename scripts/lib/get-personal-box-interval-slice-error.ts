import { getPersonalBoxIntervalGeometry } from "#/scripts/lib/get-personal-box-interval-geometry"
import { getArmIntervalCuboidError } from "#/world/scene/figure/get-arm-interval-cuboid-error"
import { getMovingBoxesNonArmError } from "#/world/scene/figure/get-moving-boxes-non-arm-error"
import { getPlanarBarIntervalError } from "#/world/scene/figure/get-planar-bar-interval-error"
import { getForearmPairSelfClearanceError } from "#/world/scene/figure/get-forearm-pair-self-clearance-error"
type Props = Parameters<typeof getPersonalBoxIntervalGeometry>[0]

/** Every slice retains fixed solids, moving board/post sweeps, certified bridge contact and the complete external body clearance. */
export function getPersonalBoxIntervalSliceError(props: Props): Error | null {
  const geometry = getPersonalBoxIntervalGeometry(props)
  if (geometry instanceof Error) return geometry
  const context = props.context,
    frame = geometry.frame,
    native = { skeleton: frame.posed.skeleton, scale: context.bounds.l.scale, rootY: frame.posed.rootY, ceiling: context.fixed.ceiling }
  const fixed = getArmIntervalCuboidError({ ...native, margins: geometry.margins, boxes: context.fixed.obstacles })
  if (fixed) return fixed
  const moving = getArmIntervalCuboidError({ ...native, margins: { l: geometry.margins.l + geometry.barMargin, r: geometry.margins.r + geometry.barMargin }, boxes: geometry.moving })
  if (moving) return moving
  const body = getMovingBoxesNonArmError({ body: geometry.body, boxes: geometry.moving, margin: geometry.barMargin })
  if (body) return body
  const self = getForearmPairSelfClearanceError({ look: frame.look, skeleton: frame.posed.skeleton, margins: geometry.margins })
  if (self) return self

  return getPlanarBarIntervalError({
    body: geometry.body,
    skeleton: frame.posed.skeleton,
    bodyScale: context.bounds.l.scale,
    bar: frame.bar,
    elbowMargins: geometry.elbowMargins,
    barMargin: geometry.barMargin,
  })
}
