import { z } from "zod"
export const spareBlanketStorageSchema = z.object({
  scope: z.literal("covered_blanket_on_cabinet_top"),
  status: z.literal("proposed"),
  id: z.string().min(1),
  source_blanket: z.string().min(1),
  folds: z.tuple([z.number().int().positive(), z.number().int().positive()]),
  allowance_m: z.tuple([z.number().nonnegative(), z.number().nonnegative(), z.number().nonnegative()]),
  position_m: z.tuple([z.number().nonnegative(), z.literal(0), z.number().nonnegative()]),
  cover: z.literal("clean_wool_cloth"),
  pending: z.array(z.string().min(1)).min(1),
})
