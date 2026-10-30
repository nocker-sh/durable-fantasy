import { z } from "zod"
const place = z.enum(["outside", "vestibule", "pasture"]),
  gate = z.enum(["outer", "inner"]),
  position = z.enum(["latched", "closed", "open"])
export const stockLockGateMotionSchema = z.enum(["push_open", "pull_open", "pull_close", "back_out_close"])

export const stockLockStateSchema = z.object({ operator: place, stock: z.record(z.string().min(1), place), gates: z.object({ outer: position, inner: position }), empty_checked: z.boolean() })
export const stockLockEventSchema = z.discriminatedUnion("kind", [
  z.object({
    kind: z.literal("gate"),
    gate,
    action: z.enum(["unlatch", "open", "close", "latch"]),
    motion: stockLockGateMotionSchema.optional(),
    stock_crossings: z.array(z.object({ id: z.string().min(1), to: place })).optional(),
  }),
  z.object({ kind: z.literal("operator_move"), to: place }),
  z.object({ kind: z.literal("stock_move"), id: z.string().min(1), to: place }),
  z.object({ kind: z.literal("inspect_empty") }),
])
export type StockLockState = z.infer<typeof stockLockStateSchema>
export type StockLockEvent = z.infer<typeof stockLockEventSchema>
