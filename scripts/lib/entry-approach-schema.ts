import { z } from "zod"
export const entryApproachSchema = z.object({
  room: z.string().min(1),
  door: z.tuple([z.number().int().nonnegative(), z.number().int().nonnegative()]),
  width_m: z.number().positive(),
  points_tiles: z.array(z.tuple([z.number(), z.number()])).min(2),
})
