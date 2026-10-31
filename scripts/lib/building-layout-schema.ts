import { z } from "zod"

export const buildingRoomIdsSchema = z.array(z.string().min(1))

/** Dimensions must support exact cell coverage and finite conversion to physical metres. */
export const buildingLayoutSchema = z
  .object({
    cell_m: z.number().positive(),
    width: z.number().int().positive(),
    depth: z.number().int().positive(),
    floors: z.array(z.object({ floor: z.number(), rooms: buildingRoomIdsSchema })),
  })
  .refine((layout) => Number.isSafeInteger(layout.width * layout.depth) && Number.isFinite(layout.width * layout.cell_m) && Number.isFinite(layout.depth * layout.cell_m))
