import { z } from "zod"

/** Reserve local land only; the study still has no geographic origin, terrain or adopted map. */
export const districtReservationSchema = z.object({
  scope: z.literal("unplaced_town_district"),
  status: z.literal("proposed"),
  at_m: z.tuple([z.number().nonnegative(), z.number().nonnegative()]),
  clearance_m: z.number().positive(),
})
