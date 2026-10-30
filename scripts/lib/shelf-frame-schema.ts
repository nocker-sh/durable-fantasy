import { z } from "zod"

/** Shelf dimensions use authored metres; geometric relationships are checked by shelfParts. */
export const shelfFrameSchema = z.object({
  height_m: z.number(),
  board_thickness_m: z.number(),
  board_tops_m: z.array(z.number()),
  front: z.enum(["n", "s", "w", "e"]),
  contents: z.array(z.unknown()).optional(),
})
