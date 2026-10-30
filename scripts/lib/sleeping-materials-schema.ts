import { z } from "zod"
import { pillowCoverCuttingSchema } from "#/scripts/lib/pillow-cover-cutting-schema"
import { blanketCuttingSchema } from "#/scripts/lib/blanket-cutting-schema"
const text = z.string().min(1)
export const sleepingMaterialsSchema = z.object({
  scope: z.literal("single_bed_and_made_linen"),
  status: z.literal("proposed"),
  bed: text,
  frame: z.object({ maker: text, timber_supplier: text, material: z.literal("wood") }),
  textile: z.object({ spinner: text, weaver: text, tailor: text, wool_supplier: text }),
  mattress: z.object({ cover: z.literal("wool_cloth"), filling: z.literal("washed_wool") }),
  linen: z.object({ pillow_cover: z.literal("wool_cloth"), pillow_filling: z.literal("washed_wool"), blanket: z.literal("woven_wool") }),
  blanket_cutting: blanketCuttingSchema.optional(),
  pillow_cover_cutting: pillowCoverCuttingSchema.optional(),
  pending: z.array(text).min(1),
})
export const measuredSleepingPlaceSchema = z.array(z.object({ id: text, resident: text, grid_symbol: z.string().length(1) }))
