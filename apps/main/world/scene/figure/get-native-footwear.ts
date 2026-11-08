import { createBodyContext } from "#/world/scene/figure/context"
import { getShoeCapsule } from "#/world/scene/figure/get-shoe-capsule"
import type { Footwear } from "#/world/scene/figure/footing"
import type { Look } from "#/world/scene/figure/look"
import type { Skel } from "#/world/scene/rig"

/** 外見と姿勢から描画と同じ靴だけを求め、接地に必要な形状を渡す。 */
export function getNativeFootwear(look: Look, skeleton: Skel): Footwear {
  const context = createBodyContext(look, skeleton, null)
  return {
    l: getShoeCapsule({ foot: context.J.foot_l, ball: context.J.ball_l, kind: context.foot_, scale: context.S }),
    r: getShoeCapsule({ foot: context.J.foot_r, ball: context.J.ball_r, kind: context.foot_, scale: context.S }),
  }
}
