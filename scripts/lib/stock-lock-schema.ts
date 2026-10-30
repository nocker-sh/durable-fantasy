import { z } from "zod"
import { stockLockEventSchema } from "#/world/town/stock-lock-schemas"
import { stockLockLeafSchema } from "#/scripts/lib/stock-lock-leaf-schema"
import { stockLockWalkingSchema } from "#/scripts/lib/stock-lock-walking-schema"
import { stockLockOperationsSchema } from "#/scripts/lib/stock-lock-operations-schema"
const cell = z.number().int().nonnegative().safe()

/** A local, unassigned two-gate reservation remains separate from the native permanently open pasture entrance. */
export const stockLockSchema = z.object({
  status: z.literal("proposed"),
  scope: z.literal("caretaker_visit_retaining_stock"),
  operator: z.string().min(1),
  site_status: z.literal("unassigned"),
  layout: z.object({ cell_m: z.number().positive(), rows: z.array(z.string().min(1).max(256)).min(1).max(256) }),
  zones: z.array(z.object({ symbol: z.literal("S"), role: z.literal("operator_wait"), rect: z.tuple([cell, cell, z.number().int().positive().safe(), z.number().int().positive().safe()]) })).length(1),
  gates: z
    .array(
      z.object({
        id: z.enum(["outer", "inner"]),
        side: z.enum(["west", "east"]),
        door: z.tuple([cell, cell]),
        width_cells: z.number().int().positive().safe(),
        hinge: z.literal("north"),
        opens_towards: z.enum(["vestibule", "pasture"]),
        leaf: stockLockLeafSchema,
      }),
    )
    .length(2),
  pasture_side: z.object({ status: z.literal("unassigned"), rect_m: z.tuple([z.number(), z.number(), z.number().positive(), z.number().positive()]) }),
  walking: stockLockWalkingSchema,
  operations: stockLockOperationsSchema,
  events: z.array(stockLockEventSchema).min(1),
})
