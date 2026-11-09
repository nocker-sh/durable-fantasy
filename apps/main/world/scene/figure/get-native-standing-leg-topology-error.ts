import { createBodyContext } from "#/world/scene/figure/context"
import { STANDING_LEG_FOLD_LIMIT } from "#/world/scene/figure/standing-leg-fold-limit"
import type { Look } from "#/world/scene/figure/look"
import type { Skel } from "#/world/scene/rig"
type Props = Readonly<{ look: Look; skeleton: Skel; kneeMargins: Readonly<Record<"l" | "r", number>> }>

/** Keep the standing leg recipe for the entire slice; seated clipping and alternate clothing branches cannot inherit its convex control-point enclosure. */
export function getNativeStandingLegTopologyError(props: Props): Error | null {
  const context = createBodyContext(props.look, props.skeleton, null)
  if (
    ![context.foldRaw, context.foldSensitivity, props.kneeMargins.l, props.kneeMargins.r].every(Number.isFinite) ||
    context.foldSensitivity <= 0 ||
    props.kneeMargins.l < 0 ||
    props.kneeMargins.r < 0
  )
    return new Error("Invalid standing leg topology margins")
  const maximum = context.fold + ((props.kneeMargins.l + props.kneeMargins.r) * context.foldSensitivity) / 2
  if (maximum >= STANDING_LEG_FOLD_LIMIT) return new Error("Native leg interval may change its standing recipe")

  return null
}
