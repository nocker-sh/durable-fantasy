import { textileMaterialBudgetSchema } from "#/scripts/lib/textile-material-budget-schema"
import { z } from "zod"
const positive = z.number().positive(),
  nonnegative = z.number().nonnegative(),
  text = z.string().min(1)
export const pillowCoverCuttingSchema = z.object({
  scope: z.literal("two_six_panel_pillow_covers_cut_layout"),
  status: z.literal("proposed"),
  pillow: text,
  owner: text,
  cloth_id: text,
  width_m: positive,
  length_m: positive,
  seam_allowance_m: positive,
  gap_m: positive,
  cloth_thickness_m: positive,
  cuts: z.array(z.object({ output: text, face: z.enum(["top", "bottom", "north", "south", "west", "east"]), origin_m: z.tuple([nonnegative, nonnegative]) })).length(12),
  material_budget: textileMaterialBudgetSchema,
  pending: z.array(text).min(1),
})
