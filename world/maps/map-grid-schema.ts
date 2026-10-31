import { z } from "zod"

const coordinate = z.number().int().nonnegative()

/** JSON input remains untrusted until exact coordinate pairs and the square grid are checked. */
export const mapGridSchema = z.object({
  size: z.number().int().positive(),
  rows: z.array(z.string()),
  places: z.record(z.string(), z.tuple([coordinate, coordinate])).default(() => ({})),
})
