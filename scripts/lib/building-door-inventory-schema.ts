import { z } from "zod"
const coordinate = z.number().int().nonnegative().safe(),
  cell = z.tuple([coordinate, coordinate])

/** A portal is shared by rooms, but exactly one room owns its leaf specification, including a paired specification if used. */
export const buildingDoorInventorySchema = z.array(z.object({ room: z.string().min(1), door: cell }))
export const roomDoorPortalSchema = z.object({
  kind: z.literal("rooms"),
  floor: coordinate,
  origin: cell,
  grid: z.object({ cell_m: z.number().positive(), rows: z.array(z.string().min(1)).min(1) }),
  connections: z.array(z.object({ kind: z.enum(["door", "opening", "stair"]).optional(), door: cell.optional(), width_cells: z.number().int().positive().safe().optional() })),
  door_leaves: z.array(z.object({ door: cell }).passthrough()).optional(),
})
