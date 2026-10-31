import { z } from "zod"
import { foundationSchema } from "#/scripts/lib/foundation-schema"
import { entryStepsSchema } from "#/scripts/lib/entry-steps-schema"

export const envelopeSourceSchema = z.object({
  site_plan: z.object({ origin: z.tuple([z.number(), z.number()]), rotation_quarters: z.number().int().min(0).max(3) }),
  foundation: foundationSchema,
  roof_section: z.object({
    ridge_axis: z.enum(["x", "y"]),
    eave_underside_m: z.number().nonnegative(),
    ridge_underside_m: z.number().nonnegative(),
    overhang_m: z.number().nonnegative(),
    material: z.enum(["roof", "roof2", "slate", "thatch"]),
  }),
  entry_steps: z.array(entryStepsSchema).length(1),
})
