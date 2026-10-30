import { z } from "zod"

/** The one registered vessel has no invisible reserve; this policy does not establish daily demand or safe water quality. */
export const waterStockPlanSchema = z.object({
  scope: z.literal("single_vessel_availability"),
  status: z.literal("proposed"),
  users: z.array(z.string().min(1)).min(1),
  purposes: z.tuple([z.literal("drinking"), z.literal("cooking")]),
  reserve_container_ids: z.array(z.string()).length(0),
})
