import { getEasedSideStepOffsets } from "#/world/town/get-eased-side-step-offsets"
import { getEasedSideStepSpeedBound } from "#/world/town/get-eased-side-step-speed-bound"
import { getNativeGroundedFootTarget } from "#/world/scene/figure/get-native-grounded-foot-target"
import { getTwoBoneBallSpeedBound } from "#/lib/engine/get-two-bone-ball-speed-bound"
import type { getNativeStepLegChain } from "#/world/scene/figure/get-native-step-leg-chain"
type Props = Omit<Parameters<typeof getEasedSideStepOffsets>[0], "phase"> & Readonly<{ chain: Exclude<ReturnType<typeof getNativeStepLegChain>, Error>; from: number; to: number }>

/** The actual curved target stays inside its midpoint ball by the analytic speed bound; a regular two-sphere branch then bounds the knee throughout the slice. */
export function getNativeSideStepLegSlice(props: Props) {
  if (![props.from, props.to].every(Number.isFinite) || props.from < 0 || props.from >= props.to || props.to > 1) return new Error("Invalid native leg interval")
  const speed = getEasedSideStepSpeedBound(props),
    offsets = getEasedSideStepOffsets({ ...props, phase: (props.from + props.to) / 2 })
  if (speed instanceof Error) return speed
  if (offsets instanceof Error) return offsets
  const chain = props.chain,
    target = getNativeGroundedFootTarget({ skeleton: chain.native, side: chain.side, offset: offsets[chain.side], clearance: chain.clearance })
  if (target instanceof Error) return target
  const knee = getTwoBoneBallSpeedBound({ ...chain, target, radius: (speed.foot * (props.to - props.from)) / 2, targetSpeed: speed.foot })
  if (knee instanceof Error) return knee

  return { from: props.from, to: props.to, kneeLocalSpeed: knee, footLocalSpeed: speed.foot, bodySpeed: speed.body }
}
