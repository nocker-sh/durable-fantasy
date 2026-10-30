import { getWindmillFieldReservations } from "#/scripts/lib/get-windmill-field-reservations"
import type { ReservedLand } from "#/scripts/lib/land-use"
import type { WindmillSiteReview, WindmillSiteAllocation } from "#/scripts/lib/windmill-site-types"
type Props = Readonly<{ reviews: readonly WindmillSiteReview[]; reservations: ReadonlyMap<string, readonly ReservedLand[]> }>

/** Allocate in study order on a fresh map; even rejected land claims retain their footprint for independent collision checks. */
export function getWindmillSiteReservations(props: Props): WindmillSiteAllocation {
  const reservations = new Map(props.reservations),
    errors: string[] = []
  for (const review of props.reviews) {
    const map = review.footprint.map
    const retained = getWindmillFieldReservations({ review, reservations: reservations.get(map) ?? [] })
    if (retained instanceof Error) errors.push(`${review.footprint.id}: ${retained.message}`)
    else reservations.set(map, retained)
  }
  return {
    reservations,
    footprints: props.reviews.flatMap((review) => [
      review.footprint,
      ...(review.approach?.bounds ?? []).map((rect, index) => ({ id: `${review.footprint.id}/approach-${index + 1}`, map: review.footprint.map, rect })),
    ]),
    errors,
  }
}
