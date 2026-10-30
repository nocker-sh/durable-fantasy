import { z } from "zod"
const yieldPermille = z.number().int().min(1).max(1000)
export const textileMaterialBudgetSchema = z.object({
  scope: z.literal("proposed_whole_gram_dry_fleece_budget"),
  status: z.literal("proposed"),
  raw_lot: z.string().min(1),
  areal_mass_g_per_m2: z.number().int().positive().safe(),
  prepare_yield_permille: yieldPermille,
  spin_yield_permille: yieldPermille,
  weave_yield_permille: yieldPermille,
  pending: z.array(z.string().min(1)).min(1),
})
