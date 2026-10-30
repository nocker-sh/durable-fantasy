import { z } from "zod"
const text = z.string().min(1)
export const textileOrdersSchema = z.array(
  z
    .object({
      id: text,
      room: text,
      cloth: text,
      beneficiary: text,
      recipient: text,
      stage: z.enum(["wool", "spin", "weave", "finish"]),
      status: z.literal("proposed"),
      pending: z.array(text).min(1),
      raw_lot: text.optional(),
      supply_state: z.literal("clean_dry_prepared_wool").optional(),
      workplace: z.object({ room: text, furniture: z.string().length(1) }).optional(),
    })
    .refine((order) => {
      if (order.stage === "spin") return order.workplace !== undefined
      return order.workplace === undefined
    }, "Spinning requires its own declared workplace")
    .refine((order) => {
      if (order.stage === "wool") return order.raw_lot !== undefined && order.supply_state !== undefined
      return order.raw_lot === undefined && order.supply_state === undefined
    }, "Wool supply requires its own proposed raw pool"),
)
