import { z } from "zod"
import { stairSectionsSchema } from "#/scripts/lib/stair-sections-schema"

export const authoredFurnitureSourceSchema = z.object({
  symbol: z.string().min(1),
  name: z.string().min(1),
  runtime_kind: z.string().min(1),
  runtime_solid: z.boolean(),
  rect: z.tuple([z.number(), z.number(), z.number(), z.number()]),
})
/** Runtime stairs need actual rail and opening dimensions; unknown design values are never renderer defaults. */
export const authoredStairSectionsSourceSchema = z.array(stairSectionsSchema.element.safeExtend({ rail_inset_m: z.number().positive(), opening_length_m: z.number().nonnegative() }))
