import { z } from "zod"
export const entryStepsSchema = z.object({
  room: z.string().min(1),
  door: z.tuple([z.number().int().nonnegative(), z.number().int().nonnegative()]),
  risers: z.number().int().min(2),
  going_m: z.number().positive(),
  clear_width_m: z.number().positive(),
  rail_inset_m: z.number().nonnegative(),
  rail_height_m: z.number().positive().optional(),
  landing_depth_m: z.number().positive(),
  lower_elevation_m: z.number(),
})
