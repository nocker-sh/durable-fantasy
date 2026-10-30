import { z } from "zod"
export const cookingTopSchema = z.object({
  status: z.literal("proposed"),
  material: z.literal("iron"),
  maker: z.string().min(1),
  thickness_m: z.number().positive(),
  front_depth_m: z.number().positive(),
  minimum_bearing_m: z.number().positive(),
  pending: z.array(z.string().min(1)).min(1),
})
