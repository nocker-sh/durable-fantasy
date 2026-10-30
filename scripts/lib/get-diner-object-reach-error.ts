import { getSeatedReachError } from "#/world/scene/get-seated-reach-error"
import { getSeatedReachPathError } from "#/world/scene/get-seated-reach-path-error"
import { toHeadingWorldPoint } from "#/world/scene/to-heading-world-point"
import type { tablePlaceSettingsSchema } from "#/scripts/lib/table-place-settings-schema"
import type { Look } from "#/world/scene/figure/look"
import type { SeatedPlace } from "#/world/scene/seated-pose"
import type { Point3 } from "../../lib/engine/cuboid-motion-types"
import type { Cuboid } from "#/lib/engine/cuboid-subtraction"
import type { z } from "zod"
type Review = NonNullable<z.infer<typeof tablePlaceSettingsSchema>["places"][number]["reach_review"]>
type Props = { look: Look; place: SeatedPlace; target: Point3; review: Review; obstacles: readonly Cuboid[] }

/** Preserve endpoint diagnostics, then verify the entire advance from the shared lifted palm point. */
export function getDinerObjectReachError(props: Props): Error | null {
  const common = { look: props.look, place: props.place, hand: props.review.hand, rest: props.review.rest, pole: props.review.pole, obstacles: props.obstacles }
  const endpoint = getSeatedReachError({ ...common, target: props.target })
  if (endpoint) return endpoint
  if (!props.review.lift) return null
  const from = toHeadingWorldPoint((props.review.advance ?? props.review.lift).seat_target_m, [props.place.at[0], 0, props.place.at[1]], props.place.heading)

  return getSeatedReachPathError({ ...common, from, to: props.target })
}
