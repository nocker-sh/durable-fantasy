import { householdMealSchema } from "#/scripts/lib/household-meal-schema"
import { z } from "zod"

/** Clothing clearance remains distinct from pressure, whole-body support and the household meal routine. */
export const seatedMealReviewSchema = z
  .object({
    seated_body_review: z.object({
      scope: z.literal("rendered_frames"),
      status: z.literal("unverified"),
      chair_frame: z.object({ scope: z.literal("back_and_legs"), status: z.literal("unverified") }).optional(),
      skirt_seat: z.object({ scope: z.literal("skirt_layers_and_trousers"), status: z.literal("unverified"), residents: z.array(z.string().min(1)).min(1) }).optional(),
      garment_seat: z.object({ scope: z.literal("tunic_coat_tails_and_trousers"), status: z.literal("unverified"), residents: z.array(z.string().min(1)).min(1) }).optional(),
    }),
    household_meal: householdMealSchema,
  })
  .superRefine((review, context) => {
    if (review.seated_body_review.garment_seat?.residents.some((resident) => review.seated_body_review.skirt_seat?.residents.includes(resident)))
      context.addIssue({ code: "custom", message: "Conflicting seated garment profiles" })
    const diners = new Set(review.household_meal.seats.map((seat) => seat.resident))
    for (const group of [review.seated_body_review.garment_seat, review.seated_body_review.skirt_seat]) {
      const residents = group?.residents ?? []
      if (new Set(residents).size !== residents.length || residents.some((resident) => !diners.has(resident)))
        context.addIssue({ code: "custom", message: "Garment review must name distinct seated residents" })
    }
  })
