import { getPersonalBoxGripFrame } from "#/scripts/lib/get-personal-box-grip-frame"
import { getPlanarArmGripMotionBound } from "#/world/scene/figure/get-planar-arm-grip-motion-bound"
import type { Point3 } from "../../lib/engine/cuboid-motion-types"
type Props = Omit<Parameters<typeof getPersonalBoxGripFrame>[0], "state"> & { segment: number }

/** Vertical phases hold body, shoulder and bar axis fixed, so both arm surfaces have a whole-interval displacement bound. */
export function getPersonalBoxArmIntervalBounds(props: Props) {
  if (props.segment !== 0 && props.segment !== 2) return new Error("Lateral box travel has no stationary arm interval")
  const from = getPersonalBoxGripFrame({ ...props, state: props.segment }),
    to = getPersonalBoxGripFrame({ ...props, state: props.segment + 1 }),
    source = props.slot.packing?.opening?.reach_review?.grip_review
  if (from instanceof Error) return from
  if (to instanceof Error) return to
  if (!source || from.posed.rootY !== to.posed.rootY || from.body.some((value, axis) => value !== to.body[axis])) return new Error("Box arm interval changes its grounded body frame")
  const normal: Point3 = [from.bar.to[0] - from.bar.from[0], from.bar.to[1] - from.bar.from[1], from.bar.to[2] - from.bar.from[2]]
  const bounds = (["l", "r"] satisfies ("l" | "r")[]).map((hand) =>
    getPlanarArmGripMotionBound({ look: from.look, skeleton: from.skeleton, hand, from: from.posed.grips[hand], to: to.posed.grips[hand], pole: source.elbow_poles[hand], normal }),
  )
  if (bounds[0] instanceof Error) return bounds[0]
  if (bounds[1] instanceof Error) return bounds[1]

  return { l: bounds[0], r: bounds[1] }
}
