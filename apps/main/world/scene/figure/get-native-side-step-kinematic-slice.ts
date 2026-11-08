import { getNativeSideStepLegSlice } from "#/world/scene/figure/get-native-side-step-leg-slice"
import { getEasedSideStepOffsets } from "#/world/town/get-eased-side-step-offsets"
import { getNativeGroundedFootPose } from "#/world/scene/figure/get-native-grounded-foot-pose"
import type { getNativeSideStepLegExternalContext } from "#/world/scene/figure/get-native-side-step-leg-external-context"
type Context = Pick<Exclude<ReturnType<typeof getNativeSideStepLegExternalContext>, Error>, "look" | "native" | "pelvisDrop" | "stride" | "lift" | "direction" | "chains" | "rootY">
type Props = Readonly<{ context: Context; from: number; to: number }>

/** Leg and garment proofs share the same actual midpoint pose and complete native knee-motion bounds. */
export function getNativeSideStepKinematicSlice(props: Props) {
  const c = props.context,
    l = getNativeSideStepLegSlice({ ...c, chain: c.chains.l, from: props.from, to: props.to }),
    r = getNativeSideStepLegSlice({ ...c, chain: c.chains.r, from: props.from, to: props.to })
  if (l instanceof Error) return l
  if (r instanceof Error) return r
  const offsets = getEasedSideStepOffsets({ ...c, phase: (props.from + props.to) / 2 })
  if (offsets instanceof Error) return offsets
  const pose = getNativeGroundedFootPose({ ...c, skeleton: c.native, offsets })
  if (pose instanceof Error) return pose
  if (Math.abs(pose.rootY - c.rootY) > 1e-12) return new Error("Native interval changes its root height")
  const span = (props.to - props.from) / 2

  return {
    pose,
    kneeMargins: { l: l.kneeLocalSpeed * span, r: r.kneeLocalSpeed * span },
    legMargins: { l: Math.max(l.kneeLocalSpeed, l.footLocalSpeed) * span, r: Math.max(r.kneeLocalSpeed, r.footLocalSpeed) * span },
  }
}
