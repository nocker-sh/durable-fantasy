import { z } from "zod"
const cell = z.tuple([z.number().int().nonnegative(), z.number().int().nonnegative()])
const symbol = z
  .string()
  .length(1)
  .refine((value) => !["#", ".", "D"].includes(value))
export const windmillYardSchema = z.object({
  scope: z.literal("unplaced_windmill_workyard"),
  status: z.literal("proposed"),
  enclosure_rect: z.tuple([z.number().int().nonnegative(), z.number().int().nonnegative(), z.number().int().min(3), z.number().int().min(3)]),
  machine: symbol,
  raw_store: symbol,
  flour_store: symbol,
  receiving_table: symbol,
  covered_stores: z.array(z.object({ symbol, cover: z.literal("closed_container") })).length(2),
  gate: z.object({ cells: z.array(cell).min(2), access_requires: z.object({ rotor_stopped: z.literal(true), drive_isolated: z.literal(true), rotor_locked: z.literal(true) }) }),
  rotor_review: z.object({
    scope: z.literal("native_full_rotation_envelope"),
    status: z.literal("proposed"),
    origin: z.literal("machine_reservation_centre"),
    ground_m: z.number(),
    clearance_m: z.number().positive(),
  }),
  pending: z.array(z.string().trim().min(1)).min(1),
})
