import { z } from "zod"

/** Persistent orders retain their chosen quality and real completion time. */
export const commissionOrderSchema = z.object({ commission: z.string().max(40), readyAt: z.number().int().nonnegative(), q: z.literal([0, 1, 2, 3]) })
