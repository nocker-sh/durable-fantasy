import { z } from "zod"

export const entryApproachSectionSchema = z
  .object({
    status: z.enum(["proposed", "designed"]),
    scope: z.literal("level_turn_road_profile"),
    road_index: z.number().int().nonnegative(),
    maximum_longitudinal_grade: z.number().positive().max(1),
    maximum_cut_m: z.number().nonnegative(),
    maximum_fill_m: z.number().nonnegative(),
    pending: z.array(z.string().trim().min(1)),
  })
  .refine((plan) => (plan.status === "designed" && plan.pending.length === 0) || (plan.status === "proposed" && plan.pending.length > 0), "Surface status disagrees with its remaining design work")
