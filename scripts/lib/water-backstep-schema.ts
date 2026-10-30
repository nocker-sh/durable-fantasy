import { z } from "zod"

/** Sampled native backward steps remain a proposal until continuous clearance, balance, load and timing are resolved. */
export const waterBackstepSchema = z.object({
  scope: z.literal("sampled_native_backward_steps"),
  status: z.literal("unverified"),
  base_animation: z.literal("idle"),
  base_frame: z.literal(0),
  destination_body_m: z.tuple([z.number().nonnegative(), z.number().nonnegative()]),
  cycles: z.number().int().min(1).max(16),
  leading_foot: z.enum(["l", "r"]),
  foot_lift_m: z.number().positive(),
  pelvis_drop_m: z.number().positive(),
  settling_drop_m: z.number().nonnegative(),
})
