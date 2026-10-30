import { getStandingFootprintError } from "#/world/scene/get-standing-footprint-error"
import { skelFor } from "#/world/scene/figure/helpers/animation/skel-for"
import { FRAMES } from "#/world/scene/figure/animation"
import { getWaterStandingPlacement } from "#/scripts/lib/get-water-standing-placement"
import type { WaterLandingBodyReview } from "#/scripts/lib/water-landing-body-schema"
import type { Look } from "#/world/scene/figure/look"
type Props = Parameters<typeof getWaterStandingPlacement>[0] & { review: WaterLandingBodyReview; look: Look }

/** All declared native frames must fit; a clear root point alone is insufficient. */
export function getWaterStandingPlacementError(props: Props): Error | null {
  const placement = getWaterStandingPlacement(props)
  if (placement instanceof Error) return placement
  for (const animation of props.review.animations)
    for (const frame of Array.from({ length: FRAMES[animation] }).keys()) {
      const error = getStandingFootprintError({ ...placement, look: props.look, skeleton: skelFor(props.look, animation, frame) })
      if (error) return new Error(`${props.placement.zone}/${animation}/${frame}: ${error.message}`, { cause: error })
    }

  return null
}
