import { textileMaterialBudgetSchema } from "#/scripts/lib/textile-material-budget-schema"
import { z } from "zod"
const positive = z.number().positive(),
  nonnegative = z.number().nonnegative(),
  text = z.string().min(1)
export const blanketCuttingSchema = z.object({
  scope: z.literal("two_hemmed_blankets_cut_layout"),
  status: z.literal("proposed"),
  cloth_id: text,
  owner: text,
  width_m: positive,
  length_m: positive,
  edge_allowance_m: positive,
  gap_m: positive,
  cuts: z.array(z.object({ output: text, origin_m: z.tuple([nonnegative, nonnegative]) })).length(2),
  material_budget: textileMaterialBudgetSchema,
  pending: z.array(text).min(1),
})
