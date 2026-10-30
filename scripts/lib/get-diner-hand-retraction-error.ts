import { getSeatedWithdrawalError } from "#/world/scene/get-seated-withdrawal-error"
import { getSeatedElbowSwivelError } from "#/world/scene/get-seated-elbow-swivel-error"
import type { tablePlaceSettingsSchema } from "#/scripts/lib/table-place-settings-schema"
import type { Look } from "#/world/scene/figure/look"
import type { SeatedPlace } from "#/world/scene/seated-pose"
import type { Cuboid } from "#/lib/engine/cuboid-subtraction"
import type { z } from "zod"
type Review = NonNullable<z.infer<typeof tablePlaceSettingsSchema>["places"][number]["reach_review"]>
type Props = { look: Look; place: SeatedPlace; review: Review; obstacles: readonly Cuboid[] }

/** Swivel only at the same endpoint already reached by the native hand's withdrawal. */
export function getDinerHandRetractionError(props: Props): Error | null {
  const review = props.review,
    common = { look: props.look, place: props.place, hand: review.hand, rest: review.rest, obstacles: props.obstacles }
  if (!review.withdrawal) {
    if (review.elbow_swivel || review.lift) return new Error("Arm preparation has no withdrawal endpoint")
    return null
  }
  const withdrawal = getSeatedWithdrawalError({ ...common, seatTarget: review.withdrawal.seat_target_m })
  if (withdrawal) return new Error(`hand withdrawal: ${withdrawal.message}`, { cause: withdrawal })
  if (!review.elbow_swivel) {
    if (review.lift) return new Error("Hand lift has no connected elbow swivel")
    return null
  }
  const swivel = getSeatedElbowSwivelError({ ...common, seatTarget: review.withdrawal.seat_target_m, poleTarget: review.lift?.pole ?? review.pole })
  if (swivel) return new Error(`elbow swivel: ${swivel.message}`, { cause: swivel })

  return null
}
