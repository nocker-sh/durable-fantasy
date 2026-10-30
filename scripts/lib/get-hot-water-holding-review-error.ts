import { getHotWaterFrameContext } from "#/scripts/lib/get-hot-water-frame-context"
import { getHotWaterHoldingFrame } from "#/scripts/lib/get-hot-water-holding-frame"
import { FRAMES } from "#/world/scene/figure/animation"
import { hotWaterAnimationSchema } from "#/scripts/lib/hot-water-animation-schema"
import type { HotWaterReviewInput as Props } from "#/scripts/lib/hot-water-frame-types"

/** 静止保持は待機・見回しの全コマを照合し、運搬や注湯の成立と区別する。 */
export function getHotWaterHoldingReviewError(props: Props): Error | null {
  const context = getHotWaterFrameContext(props)
  if (context instanceof Error) return context
  for (const animation of hotWaterAnimationSchema.options)
    for (const frame of Array.from({ length: FRAMES[animation] }).keys()) {
      const held = getHotWaterHoldingFrame({ ...context, animation, frame })
      if (held instanceof Error) return new Error(`holding/${animation}/${frame}: ${held.message}`, { cause: held })
    }
  return null
}
