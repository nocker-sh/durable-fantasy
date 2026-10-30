import { getSeatedReachPathError } from "#/world/scene/get-seated-reach-path-error"
import { getSeatedPolePathError } from "#/world/scene/get-seated-pole-path-error"
import { toHeadingWorldPoint } from "#/world/scene/to-heading-world-point"
import type { tablePlaceSettingsSchema } from "#/scripts/lib/table-place-settings-schema"
import type { z } from "zod"
type Review = NonNullable<z.infer<typeof tablePlaceSettingsSchema>["places"][number]["reach_review"]>
type Props = Omit<Parameters<typeof getSeatedReachPathError>[0], "from" | "to" | "pole"> & { review: Review }

/** The lifting pole can differ from the forward pole, but their poses must join at a certified fixed-palm swivel. */
export function getDinerHandLiftError(props: Props): Error | null {
  const review = props.review
  if (!review.lift) return null
  if (!review.withdrawal) return new Error("Hand lift has no withdrawal endpoint")
  const origin = [props.place.at[0], 0, props.place.at[1]] satisfies [number, number, number]
  const from = toHeadingWorldPoint(review.withdrawal.seat_target_m, origin, props.place.heading),
    target = toHeadingWorldPoint(review.lift.seat_target_m, origin, props.place.heading)
  const fromPole = review.lift.pole ?? review.pole
  const lift = getSeatedReachPathError({ ...props, from, to: target, pole: fromPole })
  if (lift) return new Error(`hand lift: ${lift.message}`, { cause: lift })
  const swivel = getSeatedPolePathError({ ...props, target, fromPole, toPole: review.pole })
  if (swivel) return new Error(`raised elbow swivel: ${swivel.message}`, { cause: swivel })

  return null
}
