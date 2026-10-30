import { z } from "zod"
import { foundationSchema } from "#/scripts/lib/foundation-schema"
import { entryStepsSchema } from "#/scripts/lib/entry-steps-schema"
const point = z.tuple([z.number(), z.number()])
export const entryStepSiteSchema = z.object({
  building: z.object({
    id: z.string(),
    map: z.string(),
    rooms: z.array(z.string()),
    layout: z.object({ width: z.number().positive(), depth: z.number().positive(), cell_m: z.number().positive() }),
    site_plan: z.object({ origin: point, rotation_quarters: z.number().int().min(0).max(3) }),
    foundation: foundationSchema,
  }),
  room: z.object({
    id: z.string(),
    kind: z.literal("rooms"),
    building: z.string(),
    floor: z.literal(0),
    origin: point,
    grid: z.object({ cell_m: z.number().positive(), rows: z.array(z.string()).min(1) }),
    connections: z.array(z.object({ target: z.string(), door: point.optional(), width_cells: z.number().int().positive().optional() })),
  }),
  steps: entryStepsSchema,
})
