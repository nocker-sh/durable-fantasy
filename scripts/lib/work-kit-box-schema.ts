import { z } from "zod"

const text = z.string().trim().min(1)
const positive = z.number().positive()
export const workKitBoxSchema = z.object({
  storage_item: text,
  clearance_m: z.number().nonnegative(),
  contents: z
    .array(
      z.object({
        id: text,
        name: text,
        owner: text,
        makers: z.array(text).min(1),
        source: text,
        origin_m: z.tuple([z.number().nonnegative(), z.number().nonnegative(), z.number().nonnegative()]),
        size_m: z.tuple([positive, positive, positive]),
      }),
    )
    .min(1),
})
