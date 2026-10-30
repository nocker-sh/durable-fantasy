import { solveArmGripOnPlane } from "#/world/scene/figure/solve-arm-grip-on-plane"
import { getRoundBarGripProfile } from "#/world/scene/figure/get-round-bar-grip-profile"
import { getRoundBarContactError } from "#/world/scene/figure/get-round-bar-contact-error"
import { createBodyContext } from "#/world/scene/figure/context"
import type { Look } from "#/world/scene/figure/look"
import type { Skel } from "#/world/scene/rig"
import type { RoundGripBar } from "#/world/scene/figure/round-grip-bar-types"
import type { Point3 } from "../../../lib/engine/cuboid-motion-types"
type Props = Readonly<{ look: Look; skeleton: Skel; hand: "l" | "r"; target: Point3; pole: Point3; bar: RoundGripBar }>

/** The selected forearm stays normal to the whole bar; the opposite arm and its contact profile are untouched. */
export function getSingleBarGripPose(props: Props) {
  const normal: Point3 = [props.bar.to[0] - props.bar.from[0], props.bar.to[1] - props.bar.from[1], props.bar.to[2] - props.bar.from[2]]
  const solved = solveArmGripOnPlane({ ...props, normal })
  if (solved instanceof Error) return solved
  const profile = getRoundBarGripProfile({ skeleton: solved.skeleton, hand: props.hand, bar: props.bar, bodyScale: createBodyContext(props.look, props.skeleton, null).S })
  if (profile instanceof Error) return profile
  const skeleton = { ...solved.skeleton, handGrips: { ...solved.skeleton.handGrips, [props.hand]: profile } }
  const error = getRoundBarContactError({ skeleton, hand: props.hand, bar: props.bar })
  if (error) return error

  return { skeleton, solution: solved.solution }
}
