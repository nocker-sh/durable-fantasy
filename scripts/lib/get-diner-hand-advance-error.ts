import { getSeatedReachPathError } from "#/world/scene/get-seated-reach-path-error"
import { toHeadingWorldPoint } from "#/world/scene/to-heading-world-point"
import type { tablePlaceSettingsSchema } from "#/scripts/lib/table-place-settings-schema"
import type { z } from "zod"
type Review = NonNullable<z.infer<typeof tablePlaceSettingsSchema>["places"][number]["reach_review"]>
type Props = Omit<Parameters<typeof getSeatedReachPathError>[0], "from" | "to" | "pole"> & { review: Review }

/** Reach the front of the diner before turning in toward a dish, keeping the lifted grip as the shared start. */
export function getDinerHandAdvanceError(props: Props): Error | null {
  const review = props.review
  if (!review.advance) return null
  if (!review.lift) return new Error("Hand advance has no lift endpoint")
  const origin = [props.place.at[0], 0, props.place.at[1]] satisfies [number, number, number]
  const from = toHeadingWorldPoint(review.lift.seat_target_m, origin, props.place.heading),
    to = toHeadingWorldPoint(review.advance.seat_target_m, origin, props.place.heading)
  const error = getSeatedReachPathError({ ...props, from, to, pole: review.pole })
  if (error) return new Error(`hand advance: ${error.message}`, { cause: error })

  return null
}
