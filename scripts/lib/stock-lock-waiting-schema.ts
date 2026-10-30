import { z } from "zod"

/** These are temporary stationary placements during a visit, not individual pens or a replacement grazing territory. */
export const stockLockWaitingSchema = z.object({
  status: z.literal("proposed"),
  scope: z.literal("stationary_herd_during_caretaker_visit"),
  frame: z.literal("pasture_northwest_metres"),
  clearance_m: z.number().nonnegative(),
  assignments: z.array(z.object({ animal: z.string().min(1), point_m: z.tuple([z.number(), z.number()]) })).min(1),
  arrival_status: z.literal("unreviewed"),
  behaviour_status: z.literal("unreviewed"),
})
