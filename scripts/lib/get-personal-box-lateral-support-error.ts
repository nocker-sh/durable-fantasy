import { smooth } from "../../lib/engine/smooth"
import { getPersonalBoxLateralContext } from "#/scripts/lib/get-personal-box-lateral-context"
import { getNativeLowSideStepPose } from "#/world/scene/figure/get-native-low-side-step-pose"
import { getNativePlantedFootwearError } from "#/world/scene/figure/get-native-planted-footwear-error"
import type { getPersonalBoxLateralFrame } from "#/scripts/lib/get-personal-box-lateral-frame"
type Props = Parameters<typeof getPersonalBoxLateralContext>[0] & { frame: Exclude<ReturnType<typeof getPersonalBoxLateralFrame>, Error> }

/** The left shoe stays fixed until both land, then the right shoe stays fixed; the released knee is not counted as support. */
export function getPersonalBoxLateralSupportError(props: Props): Error | null {
  const context = getPersonalBoxLateralContext(props)
  if (context instanceof Error) return context
  const anchor: { phase: number; side: "l" | "r" } = { phase: 0, side: "l" }
  if (props.phase > 0.5) {
    anchor.phase = 0.5
    anchor.side = "r"
  }
  const step = getNativeLowSideStepPose({
    skeleton: context.base.skeleton,
    phase: anchor.phase,
    stride: context.stride,
    lift: context.source.foot_lift_m,
    pelvisRise: context.source.pelvis_rise_m,
    direction: "right",
  })
  if (step instanceof Error) return step
  const progress = smooth(0, 1, props.phase)
  const frame = props.frame,
    body: readonly [number, number] = [context.base.body[0], context.base.body[1] - context.stride * (progress - anchor.phase)]

  return getNativePlantedFootwearError({
    look: frame.look,
    heading: Math.PI / 2,
    sides: [anchor.side],
    from: { skeleton: step.skeleton, body, rootY: context.base.posed.rootY },
    to: { skeleton: frame.posed.skeleton, rootY: frame.posed.rootY, body: frame.body },
  })
}
