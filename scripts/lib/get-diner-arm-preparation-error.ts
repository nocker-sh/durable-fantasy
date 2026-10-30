import { getNativeDiningChairError } from "#/scripts/lib/get-native-dining-chair-error"
import { getDinerHandLiftError } from "#/scripts/lib/get-diner-hand-lift-error"
import { getSeatedRestError } from "#/world/scene/get-seated-rest-error"
import { getDinerHandRetractionError } from "#/scripts/lib/get-diner-hand-retraction-error"
import { getDinerHandAdvanceError } from "#/scripts/lib/get-diner-hand-advance-error"
import type { getDiningSeatGeometry } from "#/scripts/lib/get-dining-seat-geometry"
import type { tablePlaceSettingsSchema } from "#/scripts/lib/table-place-settings-schema"
import type { Look } from "#/world/scene/figure/look"
import type { Cuboid } from "#/lib/engine/cuboid-subtraction"
import type { z } from "zod"
type Review = NonNullable<z.infer<typeof tablePlaceSettingsSchema>["places"][number]["reach_review"]>
type Geometry = Exclude<ReturnType<typeof getDiningSeatGeometry>, Error>
type Props = { look: Look; geometry: Geometry; review: Review; obstacles: readonly Cuboid[] }

/** Connect withdrawal, fixed-palm swivel and lift before any forward motion over the tabletop. */
export function getDinerArmPreparationError(props: Props): Error | null {
  const review = props.review,
    common = { look: props.look, place: props.geometry.place, hand: review.hand, rest: review.rest, obstacles: props.obstacles }
  const chair = getNativeDiningChairError(props.look, props.geometry, review.rest)
  if (chair) return chair
  const rest = getSeatedRestError(common)
  if (rest) return rest
  const retraction = getDinerHandRetractionError({ ...common, review })
  if (retraction) return retraction
  const lift = getDinerHandLiftError({ ...common, review })
  if (lift) return lift
  return getDinerHandAdvanceError({ ...common, review })
}
