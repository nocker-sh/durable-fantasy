import { solveArmGripOnPlane } from "#/world/scene/figure/solve-arm-grip-on-plane"
import { getRoundBarGripProfile } from "#/world/scene/figure/get-round-bar-grip-profile"
import { getRoundBarContactError } from "#/world/scene/figure/get-round-bar-contact-error"
import { createBodyContext } from "#/world/scene/figure/context"
import type { Look } from "#/world/scene/figure/look"
import type { Skel } from "#/world/scene/rig"
import type { RoundGripBar } from "#/world/scene/figure/round-grip-bar-types"
import type { Point3 } from "#/lib/engine/cuboid-motion-types"
type Props = { look: Look; skeleton: Skel; grips: Record<"l" | "r", Point3>; bar: RoundGripBar; poles: Record<"l" | "r", Point3> }

/** Both forearms stay normal to the complete bar, keeping its envelope in front of the unchanged wrist and cuff planes. */
export function getBimanualBarGripPose(props: Props) {
  const normal: Point3 = [props.bar.to[0] - props.bar.from[0], props.bar.to[1] - props.bar.from[1], props.bar.to[2] - props.bar.from[2]]
  const left = solveArmGripOnPlane({ skeleton: props.skeleton, hand: "l", target: props.grips.l, pole: props.poles.l, normal })
  if (left instanceof Error) return left
  const right = solveArmGripOnPlane({ skeleton: left.skeleton, hand: "r", target: props.grips.r, pole: props.poles.r, normal })
  if (right instanceof Error) return right
  const bodyScale = createBodyContext(props.look, props.skeleton, null).S
  const l = getRoundBarGripProfile({ skeleton: right.skeleton, hand: "l", bar: props.bar, bodyScale }),
    r = getRoundBarGripProfile({ skeleton: right.skeleton, hand: "r", bar: props.bar, bodyScale })
  if (l instanceof Error) return l
  if (r instanceof Error) return r
  const skeleton = { ...right.skeleton, handGrips: { ...right.skeleton.handGrips, l, r } }
  for (const hand of ["l", "r"] satisfies ("l" | "r")[]) {
    const error = getRoundBarContactError({ skeleton, hand, bar: props.bar })
    if (error) return error
  }

  return { skeleton, left: left.solution, right: right.solution }
}
