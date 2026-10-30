import { getFrontAccessHandleStepContext } from "#/scripts/lib/get-front-access-handle-step-context"
import { getFrontAccessHandleFrame } from "#/scripts/lib/get-front-access-handle-frame"
import { getNativeGroundedFootPose } from "#/world/scene/figure/get-native-grounded-foot-pose"
import { withNativeLegPose } from "#/world/scene/figure/with-native-leg-pose"
type Props = Parameters<typeof getFrontAccessHandleStepContext>[0]

/** Stepping solves native legs before the same one-hand grip; no shoe is allowed to slide as a substitute for a step. */
export function getFrontAccessHandleStepFrame(props: Props) {
  const context = getFrontAccessHandleStepContext(props)
  if (context instanceof Error) return context
  const base = getFrontAccessHandleFrame({ ...props, progress: context.progress })
  if (base instanceof Error) return base
  const legs = getNativeGroundedFootPose({ look: base.look, skeleton: base.native, pelvisDrop: context.source.standing_support.pelvis_drop_m, offsets: context.offsets })
  if (legs instanceof Error) return legs
  const skeleton = withNativeLegPose({ upper: base.posed.skeleton, legs: legs.skeleton })
  if (skeleton instanceof Error) return skeleton

  return { ...base, skeleton: legs.skeleton, posed: { ...base.posed, skeleton, rootY: legs.rootY }, offsets: context.offsets }
}
