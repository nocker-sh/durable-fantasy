import { lowerNativePose } from "#/world/scene/figure/lower-native-pose"
import { buildBody } from "#/world/scene/figure/body"
import { groundFootwear } from "#/world/scene/figure/footing"
import { solveFootTarget } from "#/world/scene/figure/solve-foot-target"
import { getNativeGroundedFootTarget } from "#/world/scene/figure/get-native-grounded-foot-target"
import type { Look } from "#/world/scene/figure/look"
import type { Skel } from "#/world/scene/rig"
import type { getSideStepOffsets } from "#/world/town/get-side-step-offsets"
type Props = Readonly<{ look: Look; skeleton: Skel; pelvisDrop: number; offsets: Exclude<ReturnType<typeof getSideStepOffsets>, Error> }>

/** Static preparation and stepping solve the same native shoes, preserving their heel-to-toe vectors and both leg lengths. */
export function getNativeGroundedFootPose(props: Props) {
  if (![props.offsets.body, ...props.offsets.l, ...props.offsets.r].every(Number.isFinite) || props.offsets.l[1] < 0 || props.offsets.r[1] < 0) return new Error("Invalid native foot offsets")
  if (Object.keys(props.skeleton.handGrips ?? {}).length) return new Error("Native foot placement must precede hand contact constraints")
  const ground = groundFootwear(buildBody(props.look, props.skeleton, null).footwear),
    lowered = lowerNativePose({ skeleton: props.skeleton, drop: props.pelvisDrop })
  if (lowered instanceof Error) return lowered
  const pose = { skeleton: lowered }

  for (const side of ["l", "r"] satisfies ("l" | "r")[]) {
    const contact = ground.feet.find((entry) => entry.side === side)
    if (!contact) return new Error("Missing native shoe clearance")
    const target = getNativeGroundedFootTarget({ skeleton: props.skeleton, side, offset: props.offsets[side], clearance: contact.clearance })
    if (target instanceof Error) return target
    const solved = solveFootTarget({ skeleton: pose.skeleton, side, target })
    if (solved instanceof Error) return solved
    pose.skeleton = solved
  }

  return { skeleton: pose.skeleton, rootY: ground.rootY, offsets: props.offsets }
}
