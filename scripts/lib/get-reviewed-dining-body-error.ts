import { getNativeDiningSeatError } from "#/scripts/lib/get-native-dining-seat-error"
import { getNativeDiningGarmentSeatError } from "#/scripts/lib/get-native-dining-garment-seat-error"
import type { seatedMealReviewSchema } from "#/scripts/lib/seated-meal-review-schema"
import type { Look } from "#/world/scene/figure/look"
import type { z } from "zod"
type Props = { look: Look; geometry: Parameters<typeof getNativeDiningSeatError>[1]; resident: string; review: z.infer<typeof seatedMealReviewSchema>["seated_body_review"] }

/** Apply only the named garment review; an unreviewed outfit never inherits another resident's clearance proof. */
export function getReviewedDiningBodyError(props: Props): Error | null {
  const contact = getNativeDiningSeatError(props.look, props.geometry)
  if (contact) return contact
  if (props.review.skirt_seat?.residents.includes(props.resident)) return getNativeDiningGarmentSeatError(props.look, props.geometry, "skirt")
  if (!props.review.garment_seat?.residents.includes(props.resident)) return null

  return getNativeDiningGarmentSeatError(props.look, props.geometry)
}
