import { z } from "zod"
const point = z.tuple([z.number(), z.number()]),
  index = z.number().int().nonnegative().safe()
const attachment = z.discriminatedUnion("kind", [
  z.object({ kind: z.literal("preserved") }),
  z.object({ kind: z.literal("road"), source_index: index }),
  z.object({ kind: z.literal("building"), building: z.string().min(1) }),
  z.object({ kind: z.literal("stock_lock"), facility: z.string().min(1) }),
])

/** Replace geometry with explicit endpoint obligations; widths and materials remain owned by the source roads. */
export const mapRoadPlanSchema = z.object({
  status: z.literal("proposed"),
  changes: z
    .array(z.object({ source_index: index, source_start: point, source_end: point, points_tiles: z.array(point).min(2), start: attachment, end: attachment, purpose: z.string().min(1) }))
    .min(1),
})
