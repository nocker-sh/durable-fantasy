import { z } from "zod"

export const roomOriginSchema = z.tuple([z.number().int(), z.number().int()])

/** A room footprint is rectangular; missing rows must never count as unoccupied building space. */
export const roomGridSchema = z
  .object({
    cell_m: z.number().positive(),
    rows: z.array(z.string().min(1)).min(1),
  })
  .refine((grid) => grid.rows.every((row) => row.length === grid.rows[0].length))
