import { getHotWaterFrameContext } from "#/scripts/lib/get-hot-water-frame-context"
import { getHotWaterReachFrame } from "#/scripts/lib/get-hot-water-reach-frame"
import { FRAMES } from "#/world/scene/figure/animation"
import type { HotWaterReviewInput as Props } from "./hot-water-frame-types"

/** Static frames check reach, palm openings, cuff planes, the whole pot and table space; load, attachment and a moving pour remain separate. */
export function getHotWaterReachReviewError(props: Props): Error | null {
  const context = getHotWaterFrameContext(props)
  if (context instanceof Error) return context
  const source = context.definition.plan.serving.pose_review.reach_review
  for (const placed of context.review.poses)
    for (const animation of source.animations)
      for (const frame of Array.from({ length: FRAMES[animation] }).keys()) {
        const reached = getHotWaterReachFrame({ ...context, placed, animation, frame })
        if (reached instanceof Error) return new Error(`${placed.cup}/${animation}/${frame}: ${reached.message}`, { cause: reached })
      }

  return null
}
