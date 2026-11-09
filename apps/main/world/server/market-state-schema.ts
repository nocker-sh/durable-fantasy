import { z } from "zod"
import type { MarketState } from "#/world/core/market-types"

const quantity = z.number().nonnegative()

/** Validate saved structure without restricting IDs to the current catalogue. */
export const marketStateSchema = z.object({
  shelf: z.record(z.string(), z.record(z.string(), z.tuple([quantity, quantity, quantity, quantity]))),
  at: z.number(),
  since: z.number().optional(),
  stock: z.record(z.string(), z.record(z.string(), quantity)).optional(),
}) satisfies z.ZodType<MarketState>
