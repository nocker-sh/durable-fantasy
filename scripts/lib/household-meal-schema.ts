import { z } from "zod"

/** Every named household diner has a dedicated chair at the same physical dining surface. */
export const householdMealSchema = z.object({
  table: z.string().length(1),
  seats: z.array(z.object({ resident: z.string().min(1), chair: z.string().length(1) })).min(1),
})
