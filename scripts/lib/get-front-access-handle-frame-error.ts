import { getNativeFixedCuboidClearanceError } from "#/world/scene/figure/get-native-fixed-cuboid-clearance-error"
import { getCertifiedSingleBarBodyError } from "#/world/scene/figure/get-certified-single-bar-body-error"
import { getForearmSelfClearanceError } from "#/world/scene/figure/get-forearm-self-clearance-error"
import { buildBody } from "#/world/scene/figure/body"
import { createBodyContext } from "#/world/scene/figure/context"
import { getNativeBodyFloorError } from "#/world/scene/figure/get-native-body-floor-error"
import type { getFrontAccessHandleFrame } from "#/scripts/lib/get-front-access-handle-frame"
type Props = Readonly<{ frame: Exclude<ReturnType<typeof getFrontAccessHandleFrame>, Error> }>

/** The selected bar's contact certificate never exempts posts, another handle or the opposite arm. */
export function getFrontAccessHandleFrameError(props: Props): Error | null {
  const frame = props.frame,
    skeleton = frame.posed.skeleton,
    body = buildBody(frame.look, skeleton, null),
    bodyScale = createBodyContext(frame.look, skeleton, null).S
  const floor = getNativeBodyFloorError({ look: frame.look, skeleton, rootY: frame.posed.rootY })
  if (floor) return floor
  const contact = getCertifiedSingleBarBodyError({ body, skeleton, bodyScale, hand: frame.hand, bar: frame.bar })
  if (contact) return contact
  const fixed = getNativeFixedCuboidClearanceError({
    look: frame.look,
    skeleton,
    body: frame.body,
    rootY: frame.posed.rootY,
    heading: Math.PI / 2,
    ceiling: frame.section.ceiling,
    obstacles: [...frame.section.obstacles, ...frame.solids],
  })
  if (fixed) return fixed

  return getForearmSelfClearanceError({ look: frame.look, skeleton, hand: frame.hand, margin: 0 })
}
