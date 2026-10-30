import { z } from "zod"
import type { NatureState } from "#/world/core/nature/types"

/** Saved nodes may outlive the current map definitions; validate their amounts and timestamps. */
export const natureStateSchema = z.object({
  nodes: z.record(z.string(), z.object({ left: z.number().int().nonnegative(), at: z.number() })),
}) satisfies z.ZodType<NatureState>
