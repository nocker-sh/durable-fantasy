import { z } from "zod"
const positive = z.number().positive()
export const bedLinenSchema = z
  .array(
    z.object({
      id: z.string().min(1),
      kind: z.enum(["pillow", "blanket"]),
      position_m: z.tuple([z.number().nonnegative(), z.number().nonnegative()]),
      width_m: positive,
      length_m: positive,
      thickness_m: positive,
    }),
  )
  .length(2)
