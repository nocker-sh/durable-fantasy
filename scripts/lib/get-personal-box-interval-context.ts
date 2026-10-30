import { getPersonalBoxArmIntervalBounds } from "#/scripts/lib/get-personal-box-arm-interval-bounds"
import { getPersonalBoxFixedObstacles } from "#/scripts/lib/get-personal-box-fixed-obstacles"
import { getPersonalBoxMotionFrame } from "#/scripts/lib/get-personal-box-motion-frame"
import { getPersonalBoxLidReview } from "#/scripts/lib/get-personal-box-lid-review"
import { toHeadingLocalCuboid } from "#/world/scene/to-heading-local-cuboid"
import type { Cuboid } from "#/lib/engine/cuboid-subtraction"
type Props = Parameters<typeof getPersonalBoxArmIntervalBounds>[0]

/** Resolve fixed native obstacles and one global speed bound once for a vertical phase with an unchanged grounded body. */
export function getPersonalBoxIntervalContext(props: Props) {
  const bounds = getPersonalBoxArmIntervalBounds(props),
    fixed = getPersonalBoxFixedObstacles(props),
    review = getPersonalBoxLidReview(props),
    first = getPersonalBoxMotionFrame({ ...props, progress: 0 })
  if (bounds instanceof Error) return bounds
  if (fixed instanceof Error) return fixed
  if (review instanceof Error) return review
  if (first instanceof Error) return first
  if (first.look.shield) return new Error("Moving shield has no static-body interval proof")
  const obstacles: Cuboid[] = []
  for (const box of fixed.obstacles) {
    const native = toHeadingLocalCuboid({ box, root: [first.body[0], first.posed.rootY, first.body[1]], heading: Math.PI / 2 })
    if (native instanceof Error) return native
    obstacles.push(native)
  }

  return { props, bounds, fixed: { ceiling: fixed.ceiling, obstacles }, lidSpeed: Math.abs(review.offsets[props.segment + 1][1] - review.offsets[props.segment][1]) }
}
