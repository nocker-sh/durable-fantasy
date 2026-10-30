import { z } from "zod"
import { bedLinenSchema } from "#/scripts/lib/bed-linen-schema"
const positive = z.number().positive()
export const bedDimensionsSchema = z.object({
  frame_height_m: positive,
  deck_thickness_m: positive,
  rail_width_m: positive,
  rail_height_m: positive,
  leg_width_m: positive,
  head_height_m: positive,
  mattress_thickness_m: positive,
  head_side: z.enum(["n", "s", "w", "e"]),
  linen: bedLinenSchema.nullable().optional(),
})
