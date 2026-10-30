import type { getWindmillYardSiteReview } from "#/scripts/lib/get-windmill-yard-site-review"
import type { ReservedLand } from "#/scripts/lib/land-use"
type Props = Readonly<{ review: Exclude<ReturnType<typeof getWindmillYardSiteReview>, Error | null>; reservations: readonly ReservedLand[] }>

/** Replace only the matching original field, making double allocation and stale field definitions explicit errors. */
export function getWindmillFieldReservations(props: Props): readonly ReservedLand[] | Error {
  const review = props.review,
    owned = props.reservations.filter((land) => land.id === review.sourceFieldId)
  if (owned.length !== 1 || owned[0].rect.some((value, axis) => value !== review.fieldRect[axis])) return new Error("Mill field was already partitioned or changed")
  const retained = review.partition.retained.map((rect, index) => ({
    id: `${review.sourceFieldId}/${review.footprint.id}/retained-${index + 1}`,
    rect: [rect.x0, rect.z0, rect.x1, rect.z1] satisfies readonly [number, number, number, number],
  }))
  return props.reservations.flatMap((land) => (land.id === review.sourceFieldId ? retained : [land]))
}
