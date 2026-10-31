import { lowerNativePose } from "#/world/scene/figure/lower-native-pose"
import { getNativeFootwear } from "#/world/scene/figure/get-native-footwear"
import { groundFootwear } from "#/world/scene/figure/footing"
import type { Look } from "#/world/scene/figure/look"
import type { Skel } from "#/world/scene/rig"
type Props = Readonly<{ look: Look; native: Skel; pelvisDrop: number; side: "l" | "r" }>

/** Match the actual foot solver's fixed hip, original knee pole and rest lengths before either leg has been solved. */
export function getNativeStepLegChain(props: Props) {
  const lowered = lowerNativePose({ skeleton: props.native, drop: props.pelvisDrop })
  if (lowered instanceof Error) return lowered
  const ground = groundFootwear(getNativeFootwear(props.look, props.native)),
    foot = ground.feet.find((entry) => entry.side === props.side)
  if (!foot) return new Error("Native step chain has no shoe clearance")
  const rest = props.native.rest,
    hip = rest[`thigh_${props.side}`],
    knee = rest[`calf_${props.side}`],
    ankle = rest[`foot_${props.side}`]

  return {
    root: lowered.p[`thigh_${props.side}`],
    pole: lowered.p[`calf_${props.side}`],
    upper: Math.hypot(...knee.map((value, axis) => value - hip[axis])),
    lower: Math.hypot(...ankle.map((value, axis) => value - knee[axis])),
    native: props.native,
    side: props.side,
    clearance: foot.clearance,
  }
}
