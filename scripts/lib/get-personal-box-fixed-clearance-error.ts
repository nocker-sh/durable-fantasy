import { getPersonalBoxFixedObstacles } from "#/scripts/lib/get-personal-box-fixed-obstacles"
import { getNativeFixedCuboidClearanceError } from "#/world/scene/figure/get-native-fixed-cuboid-clearance-error"
import type { getPersonalBoxReachFrame } from "#/scripts/lib/get-personal-box-reach-frame"
import type { getPersonalBoxLidReview } from "#/scripts/lib/get-personal-box-lid-review"
type Props = Parameters<typeof getPersonalBoxLidReview>[0] & { frame: Exclude<ReturnType<typeof getPersonalBoxReachFrame>, Error> }

/** Only the moving lid's contact is separate; every fixed solid still blocks all body parts. */
export function getPersonalBoxFixedClearanceError(props: Props): Error | null {
  const fixed = getPersonalBoxFixedObstacles(props)
  if (fixed instanceof Error) return fixed
  const frame = props.frame

  return getNativeFixedCuboidClearanceError({
    look: frame.look,
    skeleton: frame.posed.skeleton,
    body: frame.body,
    rootY: frame.posed.rootY,
    heading: Math.PI / 2,
    ceiling: fixed.ceiling,
    obstacles: fixed.obstacles,
  })
}
