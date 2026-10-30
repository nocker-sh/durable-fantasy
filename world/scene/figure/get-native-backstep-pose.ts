import { getBackstepOffsets } from "#/world/town/get-backstep-offsets"
import { groundFootwear } from "#/world/scene/figure/footing"
import { buildBody } from "#/world/scene/figure/body"
import { lowerNativePose } from "#/world/scene/figure/lower-native-pose"
import { solveFootTarget } from "#/world/scene/figure/solve-foot-target"
import type { Look } from "#/world/scene/figure/look"
import type { Skel } from "#/world/scene/rig"
import type { Point3 } from "#/lib/engine/cuboid-motion-types"
type Props = Omit<Parameters<typeof getBackstepOffsets>[0], "clearance"> & { look: Look; skeleton: Skel }

/** Preserve the starting pose exactly; grounded shoe targets and native leg lengths constrain the following backward step. */
export function getNativeBackstepPose(props: Props) {
  const ground = groundFootwear(buildBody(props.look, props.skeleton, null).footwear),
    l = ground.feet.find((foot) => foot.side === "l"),
    r = ground.feet.find((foot) => foot.side === "r")
  if (!l || !r) return new Error("Missing backward step footwear")
  const offsets = getBackstepOffsets({ ...props, clearance: { l: l.clearance, r: r.clearance } })
  if (offsets instanceof Error) return offsets
  if (props.phase === 0) return { skeleton: props.skeleton, rootY: ground.rootY, offsets }

  const lowered = lowerNativePose({ skeleton: props.skeleton, drop: offsets.pelvisDrop })
  if (lowered instanceof Error) return lowered
  const target = (side: "l" | "r"): Point3 => [
    props.skeleton.p[`foot_${side}`][0] + offsets[side][0],
    props.skeleton.p[`foot_${side}`][1] + offsets[side][1],
    props.skeleton.p[`foot_${side}`][2] + offsets[side][2],
  ]
  const left = solveFootTarget({ skeleton: lowered, side: "l", target: target("l") })
  if (left instanceof Error) return left
  const right = solveFootTarget({ skeleton: left, side: "r", target: target("r") })
  if (right instanceof Error) return right

  return { skeleton: right, rootY: ground.rootY, offsets }
}
