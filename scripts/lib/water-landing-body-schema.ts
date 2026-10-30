import { z } from "zod"
const position = z.discriminatedUnion("kind", [
  z.object({ kind: z.literal("native_well_place"), place: z.enum(["well", "well2"]) }),
  z.object({ kind: z.literal("relative_m"), point: z.tuple([z.number(), z.number()]) }),
])
export const waterLandingBodySchema = z.object({
  scope: z.literal("native_horizontal_bounds"),
  status: z.literal("unverified"),
  resident: z.string().min(1),
  item: z.null(),
  animations: z.tuple([z.literal("idle"), z.literal("look"), z.literal("carry")]),
  placements: z.array(z.object({ zone: z.string().regex(/^[A-Z]$/), position, heading_quarters: z.number().int().min(0).max(3) })).length(3),
})
export type WaterLandingBodyReview = z.infer<typeof waterLandingBodySchema>
