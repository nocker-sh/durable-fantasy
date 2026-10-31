import { z } from "zod"

/** Authored stair dimensions are decoded before geometry calculations; metadata reading uses the same contract. */
export const stairSectionsSchema = z.array(
  z.object({
    lower_room: z.string().min(1),
    upper_room: z.string().min(1),
    furniture: z.string().length(1),
    risers: z.number().int().min(2),
    going_m: z.number().positive(),
    axis: z.enum(["x", "y"]),
    lower_end: z.enum(["start", "end"]),
    landing_depth_m: z.number().positive(),
    clear_width_m: z.number().positive(),
    rail_inset_m: z.number().nonnegative().optional(),
    opening_length_m: z.number().nonnegative().nullable(),
  }),
)
