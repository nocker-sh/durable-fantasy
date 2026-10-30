import { z } from "zod"
const text = z.string().min(1)
export const textileWoolLotsSchema = z.array(
  z.object({
    id: text,
    preparation_facility: text,
    scope: z.literal("proposed_dry_unwashed_fleece_pool"),
    status: z.literal("proposed"),
    dry_mass_g: z.number().int().positive().safe(),
    allocations: z.array(z.object({ room: text, cloth: text })).min(1),
    pending: z.array(text).min(1),
  }),
)
