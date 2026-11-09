import { createBodyContext } from "#/world/scene/figure/context"
import { KNEELING_KNEE_HEIGHT } from "#/world/scene/figure/kneeling-knee-height"
import type { Look } from "#/world/scene/figure/look"
import type { Skel } from "#/world/scene/rig"
type Props = Readonly<{ look: Look; skeleton: Skel; kneeMargins: Readonly<Record<"l" | "r", number>> }>

/** Standing skirts and coat tails stay rigid only while the unclamped fold remains below zero and neither knee can enter the kneeling branch. */
export function getNativeRigidUpperTopologyError(props: Props): Error | null {
  const context = createBodyContext(props.look, props.skeleton, null),
    margins = props.kneeMargins
  if (![context.foldRaw, context.foldSensitivity, margins.l, margins.r].every(Number.isFinite) || context.foldSensitivity <= 0 || margins.l < 0 || margins.r < 0)
    return new Error("Invalid rigid upper-body interval")
  if (context.foldRaw + ((margins.l + margins.r) * context.foldSensitivity) / 2 + 1e-12 >= 0) return new Error("Native upper interval may fold a garment")
  if (context.J.calf_l[1] - margins.l <= KNEELING_KNEE_HEIGHT * context.S + 1e-12 || context.J.calf_r[1] - margins.r <= KNEELING_KNEE_HEIGHT * context.S + 1e-12)
    return new Error("Native upper interval may enter a kneeling garment")

  return null
}
